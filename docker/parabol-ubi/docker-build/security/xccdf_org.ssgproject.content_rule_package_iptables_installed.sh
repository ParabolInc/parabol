#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_package_iptables_installed'")

if ! rpm -q --quiet "iptables" ; then
    dnf install -y "iptables"
fi
