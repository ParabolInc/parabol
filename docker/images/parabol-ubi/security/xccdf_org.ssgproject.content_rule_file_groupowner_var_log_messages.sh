#!/bin/sh
set -e

(>&2 echo "Remediating: 'xccdf_org.ssgproject.content_rule_file_groupowner_var_log_messages'")



chgrp 0 /var/log/messages

