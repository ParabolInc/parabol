#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_package_sudo_installed'")

if ! rpm -q --quiet "sudo" ; then
    dnf install -y "sudo"
fi
