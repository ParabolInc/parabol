#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_package_rng-tools_installed'")


if ! rpm -q --quiet "rng-tools" ; then
    yum install -y "rng-tools"
fi

