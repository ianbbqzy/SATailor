   import React from 'react';
   import { Button } from 'react-native';
   import auth from '@react-native-firebase/auth';

   export default function UserAuthWidget() {
     const [user, setUser] = React.useState(null);

     React.useEffect(() => {
       const unsubscribe = auth().onAuthStateChanged((user) => {
         setUser(user);
       });
       return () => unsubscribe();
     }, []);

     const signInWithGoogle = async () => {
       const provider = auth.GoogleAuthProvider;
       await auth().signInWithPopup(provider);
     };

     const signOut = async () => {
       await auth().signOut();
     };

     return (
       <View>
         {user ? (
           <Button title="Sign Out" onPress={signOut} />
         ) : (
           <Button title="Sign In with Google" onPress={signInWithGoogle} />
         )}
       </View>
     );
   }