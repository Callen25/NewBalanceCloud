// Copyright 2017 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//import axios from 'axios';
//import * as firebase from 'firebase';




const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp({
    apiKey: "#################",
    credential: admin.credential.applicationDefault(),
    authDomain: "newsbalance-4543f.firebaseapp.com",
    databaseURL: "https://newsbalance-4543f.firebaseio.com",
    projectId: "newsbalance-4543f",
    storageBucket: "newsbalance-4543f.appspot.com",
    messagingSenderId: "997667764170"
});

require('firebase/firestore');

exports.daily_cleanup = functions.pubsub.topic('daily-tick').onPublish((event) => {
  var db = admin.firestore();
  var dateBar = new Date();
  dateBar.setDate(dateBar - 2);

  var oldNewsQuery = db.collection('Articles').where('date', '<', dateBar );
  oldNewsQuery.get().then(function(querySnapshot){
    querySnapshot.forEach(function(doc) {
      doc.ref.delete();
    });
  });
});

exports.hourly_job =
  functions.pubsub.topic('hourly-tick').onPublish((event) => {


const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('######################');




var db = admin.firestore();
  var today = new Date();
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  var toDate = '' + today.getFullYear() + '-' + today.getMonth() + 1 + '-' + today.getDate();
  var yesterDate = '' + yesterday.getFullYear() + '-' + yesterday.getMonth() + 1 + '-' + yesterday.getDate();
  newsapi.v2.everything({
  	q: 'trump OR economy OR politics OR government OR war OR missile OR health care OR immigration OR racism OR sexism OR united states OR white house OR president',
  	domains: 'slate.com,theblaze.com,thehill.com',
  	from: yesterDate,
  	to: toDate,
  	languege: 'en',
  	sortBy: 'publishedAt',
  	pageSize: 100
  }).then(res => {
  	console.log(res);
  	const articles = res.articles;
  	for(var i = 0; i < articles.length; i++) {
  		docName = articles[i].author + articles[i].source.name + articles[i].publishedAt;
  		db.collection('articles').doc(docName).set(articles[i],{merge: true});
    }
	});
});

exports.addScore = functions.firestore
	.document('articles/{docId}')
	.onCreate((snap, context) => {
	var docRef = snap.ref;
	var data = snap.data();
	if(data.urlToImage == null){
		return docRef.delete();
	}
	else {
		return docRef.set({
			lScore: 0,
			rScore: 0,
			bScore: 0,
      date: new Date(),
			score: 2 }, {merge: true});
	}
});
