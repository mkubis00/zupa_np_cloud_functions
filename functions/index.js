const functions = require("firebase-functions");
const FieldValue = require('firebase-admin').firestore.FieldValue;
const moment = require('moment');
const crypto = require('crypto');

const admin = require('firebase-admin');
admin.initializeApp();


exports.increaseEventsCounter = functions.region('europe-west1').pubsub.schedule('0 18 * * 0')
.timeZone('Europe/Warsaw')
.onRun(async () =>  {
    try {
        console.debug("Encrease value of events_count");
        await admin.firestore().doc('events_counter/HSlyjj4yzJOSZiQWSEse').update('count', FieldValue.increment(1));
        console.debug("Encrease done"); 
    } catch (error) {
        console.debug(error);
    }
});


exports.createNewEvent = functions.region('europe-west1').pubsub.schedule('0 6 * * 1')
.timeZone('Europe/Warsaw')
.onRun(async () =>  {
    try {
        console.debug("Creating new Event");
        if (moment().format('dddd') == 'Monday') {

            const publishDate = moment().add(1, 'days').format('D/MM/YYYY');
            const saturday = moment().add(5, 'days').format('D/MM/YY');
            const sunday = moment().add(6, 'days').format('D/MM/YY');

            const eventUuid = crypto.randomUUID();
            const firstDayUuid = crypto.randomUUID();
            const secondDayUuid = crypto.randomUUID();
            const saturdayFirstEventElementUuid = crypto.randomUUID();
            const sundayFirstEventElementUuid = crypto.randomUUID();
            const sundaySecondEventElementUuid = crypto.randomUUID();

            let event = {
                'id': eventUuid,
                'publishDate': publishDate,
                'title': 'Następna zupa już w niedzielę - ' + sunday + '. Pamiętajcie, nie odbędzię się ona bez was!',
                'description': 'Prosimy o pomoc w zorganizowaniu najbliższej akcji i z góry dziękujemy za każde zgłoszenie. Widzimy się w niedzielę!',
                'lastDayOfEvent': sunday,
            };

            let firstEventDay = {
                'id': firstDayUuid,
                'eventId': eventUuid,
                'dayOfEvent': saturday + ' Sobota',
            };

            let secondEventDay = {
                'id': secondDayUuid,
                'eventId': eventUuid,
                'dayOfEvent': sunday + ' Niedziela',
            };

            let saturdayFirstEventElement = {
                'id': saturdayFirstEventElementUuid,
                'eventDayId': firstDayUuid,
                'hour': '12:00',
                'title': 'przygotowania w kuchni na Broniewskiego 1a',
                'participants': [],
            };

            let sundayFirstEventElement = {
                'id': sundayFirstEventElementUuid,
                'eventDayId': secondDayUuid,
                'hour': '11:00',
                'title': 'przygotowania w kuchni na Broniewskiego 1a',
                'participants': [],
            };

            let sundaySecondEventElement = {
                'id': sundaySecondEventElementUuid,
                'eventDayId': secondDayUuid,
                'hour': '16:00',
                'title': 'spotknie z potrzebującymi przy Kostki 2/12',
                'participants': [],
            }

            await admin.firestore().doc('events/' + eventUuid).set(event);
            await admin.firestore().doc('events_days/' + firstDayUuid).set(firstEventDay);
            await admin.firestore().doc('events_days/' + secondDayUuid).set(secondEventDay);
            await admin.firestore().doc('events_elements/' + saturdayFirstEventElementUuid).set(saturdayFirstEventElement);
            await admin.firestore().doc('events_elements/' + sundayFirstEventElementUuid).set(sundayFirstEventElement);
            await admin.firestore().doc('events_elements/' + sundaySecondEventElementUuid).set(sundaySecondEventElement);

            console.debug("Event creating is done"); 

        } else {
            console.debug("Event creating is failure"); 
        } 
    } catch (error) {
        console.debug(error);
    }
});


exports.deleteEvents = functions.region('europe-west1').pubsub.schedule('55 23 * * *')
.timeZone('Europe/Warsaw')
.onRun(async () =>  {
    try {
        console.debug('Deleting events');
        const now = moment().format('D/MM/YY');
        console.log(now);
        const eventsQuerySnapshot = await admin.firestore().collection('events').where('lastDayOfEvent', '==', now).get();
        for (const eventDocSnapshot of eventsQuerySnapshot.docs) {

            const eventId = eventDocSnapshot.data()['id'];
            await admin.firestore().collection('events').doc(eventId).delete();

            const daysQuerySnapshot = await admin.firestore().collection('events_days').where('eventId', '==', eventId).get();
            for (const dayDocSnapshot of daysQuerySnapshot.docs) {

                const eventDayId = dayDocSnapshot.data()['id'];
                await admin.firestore().collection('events_days').doc(eventDayId).delete();

                const elementsQuerySnapshot = await admin.firestore().collection('events_elements').where('eventDayId', '==', eventDayId).get();
                for (const elementDocSnapshot of elementsQuerySnapshot.docs) {
                    await admin.firestore().collection('events_elements').doc(elementDocSnapshot.data()['id']).delete();
                }
            }
           }
           console.debug('Deleting events is done');
    } catch (error) {
        console.debug(error);
    }
});


// firebase deploy
// firebase deploy --only functions: