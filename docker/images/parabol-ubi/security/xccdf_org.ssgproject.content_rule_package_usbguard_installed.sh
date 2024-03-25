#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_package_usbguard_installed'")


if ! rpm -q --quiet "usbguard" ; then
    yum install -y "usbguard"
fi

