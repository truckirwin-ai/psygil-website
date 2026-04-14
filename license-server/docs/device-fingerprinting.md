# Device fingerprinting

The license server treats `device_fingerprint` as an opaque 64-character hex string. The desktop app decides what goes into it. This document is a sketch of what that input should be on each platform.

## Goals

- Stable across reboots, OS updates, and app upgrades
- Changes when the user replaces the machine (honest signal, not adversarial)
- Cannot be inspected or spoofed by a non-admin user without deliberate effort
- Produces the same hash for the same hardware without network access

We are not trying to defeat a determined attacker with admin rights. We are trying to keep the honest clinician from handing a license to a colleague.

## Recipe

```
fingerprint = sha256( machine_uuid || primary_mac || os_build )
```

Concatenate the three inputs with a `|` separator, hash with SHA-256, hex-encode.

## Platform-specific sources

### macOS

- **machine_uuid**: `IOPlatformUUID` from `IOKit`
  - Swift: `IOServiceGetMatchingService(kIOMainPortDefault, IOServiceMatching("IOPlatformExpertDevice"))` then `IORegistryEntryCreateCFProperty(..., "IOPlatformUUID" as CFString, ...)`
  - Command-line equivalent: `ioreg -d2 -c IOPlatformExpertDevice | awk -F\" '/IOPlatformUUID/{print $(NF-1)}'`
- **primary_mac**: MAC of `en0` (WiFi) or the first built-in Ethernet
  - Swift: `getifaddrs` loop, take the first `AF_LINK` interface whose name starts with `en` and is not loopback
- **os_build**: major build number, not the full build string
  - Swift: `ProcessInfo.processInfo.operatingSystemVersion.majorVersion` (13 for Ventura, 14 for Sonoma, 15 for Sequoia)
  - Using the full build string ties the fingerprint to every minor OS patch — bad idea

### Windows

- **machine_uuid**: `MachineGuid` from the registry
  - `HKLM\SOFTWARE\Microsoft\Cryptography\MachineGuid` (REG_SZ)
  - PowerShell: `(Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Cryptography').MachineGuid`
- **primary_mac**: first physical adapter with a non-virtual driver
  - `GetAdaptersAddresses` from `iphlpapi.dll`, filter out `IF_TYPE_SOFTWARE_LOOPBACK` and adapters whose `Description` contains "Virtual", "VPN", "Hyper-V"
- **os_build**: Windows major version (10 or 11)
  - Registry: `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion` → `CurrentMajorVersionNumber`

### Linux

- **machine_uuid**: `/etc/machine-id` (set by `systemd-machine-id-setup`)
  - Read the file directly, strip whitespace
  - On systems without systemd, fall back to `/var/lib/dbus/machine-id`
- **primary_mac**: first non-loopback interface that is not `docker*`, `veth*`, or `br-*`
  - `getifaddrs` loop, same logic as macOS
- **os_build**: `VERSION_ID` from `/etc/os-release` (e.g. "22.04" on Ubuntu Jammy)

## What NOT to include

- **IP address**: changes with network
- **Hostname**: user-editable, often blank
- **Username**: user-editable, changes between admins
- **Disk serial**: changes when the user adds or swaps a drive
- **CPU model string**: not unique
- **Full MAC address list**: order is not stable

## Rebinding

When a user replaces their machine and needs to reassign the seat:

1. User opens Settings → Billing in the old app (if still running) or writes to `support@psygil.com`
2. Support calls `POST /api/admin/rebind` (not implemented yet — implement as a signed admin endpoint)
3. The endpoint clears `device_fingerprint`, `device_label`, and `bound_at` on the seat row
4. Next `POST /api/license/activate` on the new machine binds cleanly

For the scaffold, rebind is manual support — run the SQL directly. Automate when volume justifies it.

## Implementation stub (TypeScript, for Electron or Tauri)

```ts
import { createHash } from 'node:crypto';
import os from 'node:os';
import { execSync } from 'node:child_process';

export function deviceFingerprint(): string {
  return createHash('sha256')
    .update([machineUuid(), primaryMac(), osBuild()].join('|'))
    .digest('hex');
}

function machineUuid(): string {
  if (process.platform === 'darwin') {
    return execSync(`ioreg -d2 -c IOPlatformExpertDevice | awk -F'"' '/IOPlatformUUID/{print $(NF-1)}'`).toString().trim();
  }
  if (process.platform === 'linux') {
    return require('node:fs').readFileSync('/etc/machine-id', 'utf8').trim();
  }
  if (process.platform === 'win32') {
    const out = execSync(`powershell -command "(Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Cryptography').MachineGuid"`).toString().trim();
    return out;
  }
  throw new Error('unsupported platform');
}

function primaryMac(): string {
  const ifaces = os.networkInterfaces();
  const names = Object.keys(ifaces).filter((n) => !/^(lo|docker|veth|br-|tun|tap|vEthernet)/i.test(n));
  for (const n of names) {
    const addrs = ifaces[n] ?? [];
    for (const a of addrs) {
      if (a.mac && a.mac !== '00:00:00:00:00:00') return a.mac;
    }
  }
  return '00:00:00:00:00:00';
}

function osBuild(): string {
  if (process.platform === 'darwin') return String(os.release().split('.')[0]); // Darwin major
  if (process.platform === 'linux') return os.release().split('-')[0];
  if (process.platform === 'win32') return os.release().split('.')[0];
  return 'unknown';
}
```

For native Swift (macOS-only app), swap `ioreg` for `IOKit`. For Tauri on Rust, use the `mac_address` and `gethostid` crates plus a small FFI call for Windows.
