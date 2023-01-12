#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_package_crypto-policies_installed'")

if ! rpm -q --quiet "crypto-policies" ; then
    dnf install -y "crypto-policies"
fi
