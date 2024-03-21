# Remediation is applicable only in certain platforms
if rpm --quiet -q pam; then

AUTH_FILES=("/etc/pam.d/system-auth" "/etc/pam.d/password-auth")

for pam_file in "${AUTH_FILES[@]}"
do
    # is auth required pam_faillock.so preauth present?
    if ! grep -qE '^\s*auth\s+required\s+pam_faillock\.so\s+preauth.*$' "$pam_file" ; then
        sed -i --follow-symlinks '/^auth.*sufficient.*pam_unix.so.*/i auth        required      pam_faillock.so preauth silent' "$pam_file"
    fi

    # is auth default pam_faillock.so authfail present?
    if ! grep -qE '^\s*auth\s+(\[default=die\])\s+pam_faillock\.so\s+authfail.*$' "$pam_file" ; then
        sed -i --follow-symlinks '/^auth.*sufficient.*pam_unix.so.*/a auth        [success=ok new_authtok_reqd=ok ignore=ignore default=bad] pam_faillock.so authfail' "$pam_file"
    fi

    if ! grep -qE '^\s*account\s+required\s+pam_faillock\.so.*$' "$pam_file" ; then
        sed -E -i --follow-symlinks '/^\s*account\s*required\s*pam_unix.so/i account     required      pam_faillock.so' "$pam_file"
    fi
done

else
    >&2 echo 'Remediation is not applicable, nothing was done'
fi
