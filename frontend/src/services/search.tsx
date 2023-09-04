import axios from 'axios';
import { auth } from './auth';

//Set base URL as environment variable
const baseURL = 'something';

function makeQuery(query: string){
    const token = auth.currentUser?.getIdToken(true);
    token?.then((idToken: string | undefined) => {
        axios.get(baseURL, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            },
            params: {
                query: query
            }
        }).then((response) => {
            console.log(response.data);
        }).catch((error: Error) => {
            console.error(error);
        });
    }).catch((error: Error) => {
        console.error(error);
    });
}