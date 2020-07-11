


SERVERS="odroid1 odroid2 pine1 rpi1 xhyve2.private"
SERVERS="odroid1 pine1"


for server in $SERVERS
do
    echo "*** " $server
    scp src/* root@$server:/services/system-dashboard/node_modules/@kronos-integration/service-swarm/src
    ssh -l root -A $server "systemctl restart system-dashboard"
    ssh -l root -A $server "systemctl status system-dashboard"
done