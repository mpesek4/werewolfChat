import { config } from './config';
import firebase from 'firebase';
console.log(config)
firebase.initializeApp(config);

export const auth = firebase.auth();

export const fireauth = firebase.auth;

const settings = {timestampsInSnapshots: true};
firebase.firestore().settings(settings);

export const db = firebase.firestore();

export const firebasestore = firebase.firestore;