const Axios = require('axios').default;
const express = require('express');
require('dotenv').config();
const { supabase } = require('../services/supabase');
const app = express();
const port = 3000;

// Middleware to parse JSON body
app.use(express.json());

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const request = Axios.create({
	baseURL: 'https://deezerdevs-deezer.p.rapidapi.com',
	headers: {
		'x-rapidapi-key': 'ae17a11a07msh3d8a58482a421eep17c4fdjsn9c9285df066c',
		'x-rapidapi-host': 'deezerdevs-deezer.p.rapidapi.com'
	}
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get("/search", async (req, res) => {
	const response = await request.get('/search', {
		params: {
			q: req.query.q
		}
	});
	res.send(response.data);
});


app.post("/signup", async (req, res) => {
	const { email = '', password = '' } = req.body || {};

	const { data, error } = await supabase.auth.signUp({
		email: email,
		password: password
		// password: 'bwLQFjBPtSGVbGcMFbwq'
  	})
  
	res.send(data);  
});

app.post("/login", async (req, res) => {

	const { email = '', password = '' } = req.body || {};
	
	const { data, error } = await supabase.auth.signInWithPassword({
		email: email,
		password: password
  	})
  
	res.send(data);  
});


app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});