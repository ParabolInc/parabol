#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_configure_usbguard_auditbackend'")

if [ -e "/etc/usbguard/usbguard-daemon.conf" ] ; then
    
    LC_ALL=C sed -i "/^\s*AuditBackend=/d" "/etc/usbguard/usbguard-daemon.conf"
else
    touch "/etc/usbguard/usbguard-daemon.conf"
fi
cp "/etc/usbguard/usbguard-daemon.conf" "/etc/usbguard/usbguard-daemon.conf.bak"
# Insert at the end of the file
printf '%s\n' "AuditBackend=LinuxAudit" >> "/etc/usbguard/usbguard-daemon.conf"
# Clean up after ourselves.
rm "/etc/usbguard/usbguard-daemon.conf.bak"

