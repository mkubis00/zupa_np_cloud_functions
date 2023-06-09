## Cloud functions to mobile (ios/android) app

All change should be first submitted to develop branch. Submit changes after deploying cloud functions.

Function contains:
 - increaseEventsCounter - function which increse value of event every Sunday after event is closed.
 - createNewEvent - function which create new "Zupa Na Pietrynie" event ever Monday at 6:00 AM.
 - deleteEvents - function which delete closed event

How deploy functions

To deploy all function type <code>firebase deploy</code> in Commend Line inside project/
To deploy single/a few function type <code>firebase deploy --only functions:</code> in Commend Line ins
