class DataCapture {

    constructor(space, rssi) {
        this.space = space;
        this.rssi = rssi;
    }

}

class Space {

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.minSignal = data.minSignal;
    }


}

class People {

    constructor(data) {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.phoneNumber = data.phoneNumber;
    }

}

class Patient {

    constructor(data) {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.uuid = data.uuidBracelet;

        this.spaceNoAccess = [];

        this.initSpaceNoAccess(data.spaceNoAccess);
    }

    initSpaceNoAccess(spaceArray) {
        for (let index in spaceArray) {
            this.spaceNoAccess.push(spaceArray[index]);
        }
    }

    hasAccess(idRelai) {
        for (let index in this.spaceNoAccess) {
            if (this.spaceNoAccess[index] === idRelai) {
                return false;
            }
        }

        return true;
    }

}

class Bracelet {

    constructor(data) {
        this.uuid = data.uuid;
        this.major = data.Major;
        this.minor = data.Minor;
    }


}


module.exports = class Locator {
    /**
     * Init the module
     */
    constructor(configuration) {
        this.handlers = [];

        this.people = [];
        this.patientWithBracelet = new Map();
        this.bracelets = new Map();
        this.spacesAvailables = new Map();

        this.devices = new Map();

        this.initPeople(configuration.getConfigurationData('peoples'));
        this.initPatient(configuration.getConfigurationData('patients'));

        this.initBracelets(configuration.getConfigurationData('location:bracelets'));
        this.initSpaces(configuration.getConfigurationData('location:spaces'));
    }

    initPeople(peopleArray) {
        for (let index in peopleArray) {
            this.people.push(new People(peopleArray[index]));
        }
    }

    initPatient(patientArray) {
        for (let index in patientArray) {
            this.patientWithBracelet.set(patientArray[index].uuidBracelet.toUpperCase(), new Patient(patientArray[index]));
        }

        console.log(this.patientWithBracelet);
    }

    initBracelets(braceletArray) {
        for (let index in braceletArray) {
            this.bracelets.set(braceletArray[index].uuid.toUpperCase(), new Bracelet(braceletArray[index]));
        }
    }

    initSpaces(spaceArray) {
        for (let index in spaceArray) {
            this.spacesAvailables.set(spaceArray[index].id, new Space(spaceArray[index]));
        }

    }

    updateLocation(event) {

        if (!this.spacesAvailables.has(parseInt(event['idRelai'])))
            return false;
        if (!this.bracelets.has(event['data']['iBeacon'].uuid))
            return false;

        var rssi = Math.trunc(event['data'].rssi);

        var space = this.spacesAvailables.get(parseInt(event['idRelai']));
        var patient = this.patientWithBracelet.get(event['data']['iBeacon'].uuid);

        if (this.devices.has(event['data']['iBeacon'].uuid)) {
            var dataCaptured = this.devices.get(event['data']['iBeacon'].uuid);

            if (dataCaptured.space.id === space.id) {
                if (space.minSignal > rssi)
                    return;

                this.devices.delete(event['data']['iBeacon'].uuid);
                this.devices.set(event['data']['iBeacon'].uuid, new DataCapture(space, rssi));
            }
            else {
                if (dataCaptured.rssi > rssi)
                    return;

                this.devices.delete(event['data']['iBeacon'].uuid);
                this.devices.set(event['data']['iBeacon'].uuid, new DataCapture(space, rssi));


                if (patient.hasAccess(space.id)) {
                    this.sendMessageAccess(space, patient);
                }
                else {
                    this.sendMessageNoAccess(space, patient);
                }
            }
        }
        else {
            if (space.minSignal > rssi)
                return;

            this.devices.set(event['data']['iBeacon'].uuid, new DataCapture(space, rssi));

            if (patient.hasAccess(space.id)) {
                this.sendMessageAccess(space, patient);
            }
            else {
                this.sendMessageNoAccess(space, patient);
            }

        }
    }

    sendMessageAccess(space, patient) {
        for (let index in this.people) {
            let message = {};
            message['phoneNumber'] = this.people[index].phoneNumber;
            message['message'] = 'Bonjour ' + this.people[index].firstName + ', le patient ' + patient.firstName + ' ' + patient.lastName + ' est entré dans l\'espace \'' + space.name + '\'.';

            this.notifyAllObservers(message);
        }
    }

    sendMessageNoAccess(space, patient) {
        for (let index in this.people) {
            let message = {};
            message['phoneNumber'] = this.people[index].phoneNumber;
            message['message'] = 'Bonjour ' + this.people[index].firstName + ', le patient ' + patient.firstName + ' ' + patient.lastName + ' est entré dans l\'espace \'' + space.name + '\' sans autorisation.';

            this.notifyAllObservers(message);
        }
    }


    notify(event) {
        this.updateLocation(event);
    }

    /**
     * Notify all observers by a message which are a json string
     * @param messageJson
     */
    notifyAllObservers(message) {
        this.handlers.forEach(function (item) {
            WebsocketClient.notify(message);
        });
    }

    /**
     * Add an observer to the scanner
     * @param observer
     */
    addObserver(observer) {
        this.handlers.push(observer);
    }

    /**
     * Remove observer to the scanner
     * @param observer
     */
    removeObserver(observer) {
        this.handlers = this.handlers.filter(
            function (item) {
                if (item !== observer) {
                    return item;
                }
            }
        );
    }
}
