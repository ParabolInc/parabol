#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_accounts_passwords_pam_faillock_deny_root'")

# Remediation is applicable only in certain platforms
if rpm --quiet -q pam; then

if [ -f /usr/sbin/authconfig ]; then
    authconfig --enablefaillock --update
elif [ -f /usr/bin/authselect ]; then
    if authselect check; then
        authselect enable-feature with-faillock
        authselect apply-changes
    else
        echo "
authselect integrity check failed. Remediation aborted!
This remediation could not be applied because the authselect profile is not intact.
It is not recommended to manually edit the PAM files when authselect is available
In cases where the default authselect profile does not cover a specific demand, a custom authselect profile is recommended."
        false
    fi
fi

FAILLOCK_CONF="/etc/security/faillock.conf"
if [ -f $FAILLOCK_CONF ]; then
    if [ ! $(grep -q '^\s*even_deny_root' $FAILLOCK_CONF) ]; then
        echo "even_deny_root" >> $FAILLOCK_CONF
    fi
else
    SYSTEM_AUTH="/etc/pam.d/system-auth"
    PASSWORD_AUTH="/etc/pam.d/password-auth"
    for file in $SYSTEM_AUTH $PASSWORD_AUTH; do
        if ! grep -q "^auth.*pam_faillock.so \(preauth silent\|authfail\).*even_deny_root" $file; then
			sed -i --follow-symlinks 's/\(pam_faillock.so \(preauth silent\|authfail\).*\)$/\1 even_deny_root/g' $file
		fi
    done
fi

else
    >&2 echo 'Remediation is not applicable, nothing was done'
fi
