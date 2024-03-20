touch /etc/modprobe.d/blacklist.conf
echo "install atm /bin/true" >> /etc/modprobe.d/blacklist.conf
echo "blacklist atm" >> /etc/modprobe.d/blacklist.conf
