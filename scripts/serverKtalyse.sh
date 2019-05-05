#!/bin/sh

while :
do
  read -p "Saisir la commande (status, start, stop, quit): " INPUT_STRING
  case $INPUT_STRING in
	status)
		sudo systemctl status serverKtalyse
		;;
	start)
		sudo systemctl start serverKtalyse
		;;
	stop)
		sudo systemctl stop serverKtalyse
		;;
	quit)
		break
		;;
	*)
		echo "Commande inconnue"
		;;
  esac
done