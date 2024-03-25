#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_sudo_require_reauthentication'")



var_sudo_timestamp_timeout="0"



if /usr/sbin/visudo -qcf /etc/sudoers; then
    cp /etc/sudoers /etc/sudoers.bak
    if ! grep -P '^[\s]*Defaults.*\btimestamp_timeout=[-]?\w+\b\b.*$' /etc/sudoers; then
        # sudoers file doesn't define Option timestamp_timeout
        echo "Defaults timestamp_timeout=${var_sudo_timestamp_timeout}" >> /etc/sudoers
    else
        # sudoers file defines Option timestamp_timeout, remediate if appropriate value is not set
        if ! grep -P "^[\s]*Defaults.*\btimestamp_timeout=${var_sudo_timestamp_timeout}\b.*$" /etc/sudoers; then
            
            sed -Ei "s/(^[\s]*Defaults.*\btimestamp_timeout=)[-]?\w+(\b.*$)/\1${var_sudo_timestamp_timeout}\2/" /etc/sudoers
        fi
    fi
    
    # Check validity of sudoers and cleanup bak
    if /usr/sbin/visudo -qcf /etc/sudoers; then
        rm -f /etc/sudoers.bak
    else
        echo "Fail to validate remediated /etc/sudoers, reverting to original file."
        mv /etc/sudoers.bak /etc/sudoers
        false
    fi
else
    echo "Skipping remediation, /etc/sudoers failed to validate"
    false
fi

