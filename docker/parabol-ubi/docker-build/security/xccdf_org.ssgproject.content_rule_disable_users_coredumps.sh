#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_disable_users_coredumps'")

# Remediation is applicable only in certain platforms
if rpm --quiet -q pam; then

SECURITY_LIMITS_FILE="/etc/security/limits.conf"

if grep -qE '\*\s+hard\s+core' $SECURITY_LIMITS_FILE; then
        sed -ri 's/(hard\s+core\s+)[[:digit:]]+/\1 0/' $SECURITY_LIMITS_FILE
else
        echo "*     hard   core    0" >> $SECURITY_LIMITS_FILE
fi

else
    >&2 echo 'Remediation is not applicable, nothing was done'
fi

