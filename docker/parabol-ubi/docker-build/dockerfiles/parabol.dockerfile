ARG _NODE_VERSION=${_NODE_VERSION}
#base build for dev deps
FROM node:${_NODE_VERSION} as base

ARG _PARABOL_GIT_REF=${_PARABOL_GIT_REF}
ARG _BUILD_ENV_PATH=environments/buildenv
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

WORKDIR /home/node

ADD ${_BUILD_ENV_PATH} ./.env

RUN git clone https://github.com/ParabolInc/parabol.git -b ${_PARABOL_GIT_REF} --depth 1 && \
    cd parabol && \
    rm -rf .git/ && \
    mv /home/node/.env ./.env && \
    mkdir -p /home/node/parabol/node_modules && \
    mkdir -p /home/node/.npm-global && \
    NODE_OPTIONS=--max-old-space-size=20480 && \
    yarn install --frozen-lockfile && \
    yarn cache clean && \
    yarn db:migrate && \
    yarn pg:migrate up && \
    yarn pg:build && \
    yarn build && \
    chown -R node:1000 /home/node/parabol

#final image - copies in parabol build and applies all security configurations to container
FROM redhat/ubi8:8.6

ENV HOME=/home/node \
    USER=node

RUN groupadd -g 1000 node && \
    useradd -r -u 1000 -m -s /sbin/nologin -g node node

COPY --from=base /usr/local/bin /usr/local/bin
COPY --from=base /usr/local/include /usr/local/include
COPY --from=base /usr/local/share/man /usr/local/share/man
COPY --from=base /usr/local/share/doc /usr/local/share/doc
COPY --from=base /usr/local/share/systemtap /usr/local/share/systemtap
COPY --from=base /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=base /opt /opt
COPY --from=base /home/node/parabol/ ${HOME}/parabol
RUN rm -rf ${HOME}/parabol/.env
COPY entrypoints/buildenv /usr/local/bin/docker-entrypoint.sh
COPY security /security

COPY ./tools/ip-to-server_id /home/node/tools/ip-to-server_id

RUN echo Update packages and install security patches && \
    sed -i "s/enabled=1/enabled=0/" /etc/dnf/plugins/subscription-manager.conf && \
    echo "exclude=filesystem-*" >> /etc/dnf/dnf.conf && \
    chmod +x /security/*.sh && \
    dnf repolist && \
    dnf update -y && \
    echo "* hard maxlogins 10" > /etc/security/limits.d/maxlogins.conf && \
    /security/xccdf_org.ssgproject.content_rule_account_disable_post_pw_expiration.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_logon_fail_delay.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_max_concurrent_login_sessions.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_maximum_age_login_defs.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_minimum_age_login_defs.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_minlen_login_defs.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_dcredit.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_dictcheck.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_difok.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_lcredit.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_maxclassrepeat.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_maxrepeat.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_minclass.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_minlen.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_ocredit.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_pwhistory_remember_password_auth.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_pwhistory_remember_system_auth.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_ucredit.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_password_pam_unix_remember.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_passwords_pam_faillock_deny.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_passwords_pam_faillock_deny_root.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_passwords_pam_faillock_interval.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_passwords_pam_faillock_unlock_time.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_passwords_pam_faillock.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_umask_etc_bashrc.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_umask_etc_csh_cshrc.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_umask_etc_login_defs.sh && \
    /security/xccdf_org.ssgproject.content_rule_accounts_umask_etc_profile.sh && \
    /security/xccdf_org.ssgproject.content_rule_banner_etc_issue.sh && \
    /security/xccdf_org.ssgproject.content_rule_configure_kerberos_crypto_policy.sh && \
    /security/xccdf_org.ssgproject.content_rule_configure_openssl_crypto_policy.sh && \
    /security/xccdf_org.ssgproject.content_rule_coredump_disable_backtraces.sh && \
    /security/xccdf_org.ssgproject.content_rule_coredump_disable_storage.sh && \
    /security/xccdf_org.ssgproject.content_rule_disable_ctrlaltdel_burstaction.sh && \
    /security/xccdf_org.ssgproject.content_rule_disable_users_coredumps.sh && \
    /security/xccdf_org.ssgproject.content_rule_display_login_attempts.sh && \
    /security/xccdf_org.ssgproject.content_rule_ensure_gpgcheck_local_packages.sh && \
    /security/xccdf_org.ssgproject.content_rule_file_groupownership_system_commands_dirs.sh && \
    /security/xccdf_org.ssgproject.content_rule_no_empty_passwords.sh && \
    /security/xccdf_org.ssgproject.content_rule_openssl_use_strong_entropy.sh && \
    /security/xccdf_org.ssgproject.content_rule_package_crypto-policies_installed.sh && \
    /security/xccdf_org.ssgproject.content_rule_package_iptables_installed.sh && \
    dnf clean all && \
    rm -rf /security/ /var/cache/dnf/ /var/tmp/* /tmp/* /var/tmp/.???* /tmp/.???* && \
    chmod 755 /usr/local/bin/docker-entrypoint.sh && \
    chmod g-s /opt/yarn-v*/bin /opt/yarn-v*/lib && \
    chgrp -R root /opt/yarn-v* && \
    chgrp root /opt/yarn-v*/lib/* /opt/yarn-v*/bin/* /opt/yarn-v*/* && \
    mkdir -p /home/node/parabol/self-hosted && \
    chown node:node /home/node/parabol/self-hosted


WORKDIR ${HOME}/parabol/
USER 1000

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]