# Remediation is applicable only in certain platforms
if rpm --quiet -q pam; then


var_password_pam_dictcheck="1"



# Test if the config_file is a symbolic link. If so, use --follow-symlinks with sed.
# Otherwise, regular sed command will do.
sed_command=('sed' '-i')
if test -L "/etc/security/pwquality.conf"; then
    sed_command+=('--follow-symlinks')
fi

# If the cce arg is empty, CCE is not assigned.
if [ -z "CCE-86233-4" ]; then
    cce="CCE"
else
    cce="CCE-86233-4"
fi

# Strip any search characters in the key arg so that the key can be replaced without
# adding any search characters to the config file.
stripped_key=$(sed 's/[\^=\$,;+]*//g' <<< "^dictcheck")

# shellcheck disable=SC2059
printf -v formatted_output "%s = %s" "$stripped_key" "$var_password_pam_dictcheck"

# If the key exists, change it. Otherwise, add it to the config_file.
# We search for the key string followed by a word boundary (matched by \>),
# so if we search for 'setting', 'setting2' won't match.
if LC_ALL=C grep -q -m 1 -i -e "^dictcheck\\>" "/etc/security/pwquality.conf"; then
    "${sed_command[@]}" "s/^dictcheck\\>.*/$formatted_output/gi" "/etc/security/pwquality.conf"
else
    # \n is precaution for case where file ends without trailing newline
    printf '\n# Per %s: Set %s in %s\n' "$cce" "$formatted_output" "/etc/security/pwquality.conf" >> "/etc/security/pwquality.conf"
    printf '%s\n' "$formatted_output" >> "/etc/security/pwquality.conf"
fi

else
    >&2 echo 'Remediation is not applicable, nothing was done'
fi
