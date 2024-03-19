#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_accounts_passwords_pam_faillock_deny'")

# Remediation is applicable only in certain platforms
if rpm --quiet -q pam; then

var_accounts_passwords_pam_faillock_deny='3'


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
    if $(grep -q '^\s*deny\s*=' $FAILLOCK_CONF); then
        sed -i --follow-symlinks "s/^\s*\(deny\s*\)=.*$/\1 = $var_accounts_passwords_pam_faillock_deny/g" $FAILLOCK_CONF
    else
        echo "deny = $var_accounts_passwords_pam_faillock_deny" >> $FAILLOCK_CONF
    fi
else
    AUTH_FILES=("/etc/pam.d/system-auth" "/etc/pam.d/password-auth")

for pam_file in "${AUTH_FILES[@]}"
do
    # is auth required pam_faillock.so preauth present?
    if grep -qE '^\s*auth\s+required\s+pam_faillock\.so\s+preauth.*$' "$pam_file" ; then
        # is the option set?
        if grep -qE '^\s*auth\s+required\s+pam_faillock\.so\s+preauth.*'"deny"'=([0-9]*).*$' "$pam_file" ; then
            # just change the value of option to a correct value
            sed -i --follow-symlinks 's/\(^auth.*required.*pam_faillock.so.*preauth.*silent.*\)\('"deny"' *= *\).*/\1\2'"$var_accounts_passwords_pam_faillock_deny"'/' "$pam_file"
        # the option is not set.
        else
            # append the option
            sed -i --follow-symlinks '/^auth.*required.*pam_faillock.so.*preauth.*silent.*/ s/$/ '"deny"'='"$var_accounts_passwords_pam_faillock_deny"'/' "$pam_file"
        fi
    # auth required pam_faillock.so preauth is not present, insert the whole line
    else
        sed -i --follow-symlinks '/^auth.*sufficient.*pam_unix.so.*/i auth        required      pam_faillock.so preauth silent '"deny"'='"$var_accounts_passwords_pam_faillock_deny" "$pam_file"
    fi
    # is auth default pam_faillock.so authfail present?
    if grep -qE '^\s*auth\s+(\[default=die\])\s+pam_faillock\.so\s+authfail.*$' "$pam_file" ; then
        # is the option set?
        if grep -qE '^\s*auth\s+(\[default=die\])\s+pam_faillock\.so\s+authfail.*'"deny"'=([0-9]*).*$' "$pam_file" ; then
            # just change the value of option to a correct value
            sed -i --follow-symlinks 's/\(^auth.*[default=die].*pam_faillock.so.*authfail.*\)\('"deny"' *= *\).*/\1\2'"$var_accounts_passwords_pam_faillock_deny"'/' "$pam_file"
        # the option is not set.
        else
            # append the option
            sed -i --follow-symlinks '/^auth.*[default=die].*pam_faillock.so.*authfail.*/ s/$/ '"deny"'='"$var_accounts_passwords_pam_faillock_deny"'/' "$pam_file"
        fi
    # auth default pam_faillock.so authfail is not present, insert the whole line
    else
        sed -i --follow-symlinks '/^auth.*sufficient.*pam_unix.so.*/a auth        [default=die] pam_faillock.so authfail '"deny"'='"$var_accounts_passwords_pam_faillock_deny" "$pam_file"
    fi
    if ! grep -qE '^\s*account\s+required\s+pam_faillock\.so.*$' "$pam_file" ; then
        sed -E -i --follow-symlinks '/^\s*account\s*required\s*pam_unix.so/i account     required      pam_faillock.so' "$pam_file"
    fi
done
fi

else
    >&2 echo 'Remediation is not applicable, nothing was done'
fi
