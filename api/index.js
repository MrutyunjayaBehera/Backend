const Axios = require('axios').default;
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const { supabase } = require('../services/supabase');
const app = express();
const port = process.env.PORT || 3000;

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

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_01;
const bot = new TelegramBot(token, { polling: true });
const webhookUrl = process.env.VERCEL_DEPLOYED_URL;
bot.setWebHook(webhookUrl);

app.get('/', (req, res) => {

	// TELEGRAM BOT API
	// ==========================================================
	// bot.onText(/\/echo (.+)/, (msg, match) => {
	//   const chatId = msg.chat.id;
	//   const resp = match[1];
	//   bot.sendMessage(chatId, resp);
	// });

	const dictRequest = Axios.create({
		baseURL: 'https://api.dictionaryapi.dev/api/v2/entries/en',
	});

	bot.on('message', async (msg) => {
		console.log('msg::: ', msg);
		const chatId = msg.chat.id;
		console.log('chatId:: ', chatId);
		if (msg.text) {
			const txt = msg.text;
			try {
				const res = await dictRequest.get(`/${txt}`);
				const { meanings = [] } = res?.data?.[0];
				const { definitions = [] } = meanings?.[0];
				const { definition = '', example = '' } = definitions?.[0];
				bot.sendMessage(chatId, definition);
				if (example) {
					bot.sendMessage(chatId, `Example: ${example}`);
				}
			} catch (error) {
				bot.sendMessage(chatId, error);
			}
		}
	});
	// ==========================================================

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

	const { user = {} } = data || {};

	const { error: insertError } = await supabase
		.from('user')
		.insert({ name: user?.email, email: user?.email })
		.select();

	res.send(data);
});

app.post("/login", async (req, res) => {

	const { email = '', password = '' } = req.body || {};

	const { data, error } = await supabase.auth.signInWithPassword({
		email: email,
		password: password
	})


	if (error) {
		const { __isAuthError = false, status } = error;
		if (__isAuthError) {
			return res.status(400).send({ error: error.message, status: status });
		}
	}

	res.send(data);
});


app.get("/list_users", async (req, res) => {

	console.log('datda:: ', req.body);

	try {
		const { data, error } = await supabase.from('user').select('*');
		if (error) {
			throw error;
		}
		res.status(200).json(data);
	} catch (error) {
		console.error('Error fetching users:', error.message);
		res.status(500).json({ error: 'Failed to fetch users' });
	}

});


app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});