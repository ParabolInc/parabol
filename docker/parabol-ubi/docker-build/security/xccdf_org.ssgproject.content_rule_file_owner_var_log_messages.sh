#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_file_owner_var_log_messages'")



chown 0 /var/log/messages

