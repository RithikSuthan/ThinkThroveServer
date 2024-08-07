const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectionDb = require("./connection");
const users_collection = require("./Schema/user");
const deck_collection = require("./Schema/deck");
const card_collection = require("./Schema/card");
const registerValidation = require("./MiddleWare/SignUp.js");
const loginValidation = require("./MiddleWare/SignIn.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "https://think-trove.vercel.app" }));

// Connect to the database
connectionDb();

// Routes
app.post("/", loginValidation, async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await users_collection.findOne({ email: email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                res.json({ status: "exists", user: user });
            } else {
                res.json({ status: "invalidpassword" });
            }
        } else {
            res.json({ status: "notexists" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("Server error");
    }
});

app.post("/signup", registerValidation, async (req, res) => {
    const { uname, email, password } = req.body;
    try {
        const check = await users_collection.findOne({ email: email });
        if (check) {
            res.json({ status: "exists" });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
            const data = {
                uname,
                email,
                password: hashedPassword,
                cardNo: 0,
                deckNo: 0,
                loginTime: new Date(),
                updatedTime: new Date(),
                deleteStatus: false,
                activeStatus: true,
            };
            await users_collection.insertMany([data]);
            res.json({ status: "added" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("Server error");
    }
});

app.patch("/reset", loginValidation, async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await users_collection.findOne({ email });
        if (user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await users_collection.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
            res.status(200).json({ status: "PasswordResetSuccess" });
        } else {
            res.status(401).send({ status: "notexists" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
});

app.get("/user", async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await users_collection.findOne({ userId: userId });
        res.json(user);
    } catch (e) {
        console.log(e);
        res.status(500).send("Server error");
    }
});

app.post("/addDeck", async (req, res) => {
    const { userId, deckName } = req.body;
    try {
        const user = await users_collection.findById(userId);
        if (user) {
            const newDeck = {
                userId,
                deckName,
                cardNo: 0,
                createdDate: new Date(),
                deleteStatus: false,
                activeStatus: true,
            };
            const result = await deck_collection.insertMany([newDeck]);
            res.json({ status: "deckAdded", deck: result[0] });
            await users_collection.findByIdAndUpdate(userId, {
                $inc: { deckNo: 1 },
            });
        } else {
            res.json({ status: "userNotFound" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("Server error");
    }
});

app.get("/decks", async (req, res) => {
    const { userId } = req.query;
    try {
        const objectId = mongoose.Types.ObjectId(userId);
        const decks = await deck_collection.find({ userId: objectId, deleteStatus: false });
        res.json(decks);
    } catch (e) {
        console.log(e);
        res.status(500).send("Server error");
    }
});

app.patch("/updateDeck", async (req, res) => {
    const { deckId, deckName } = req.body;
    try {
        const updatedDeck = await deck_collection.findByIdAndUpdate(
            deckId,
            { deckName },
            { new: true }
        );
        res.json({ status: "deckUpdated", deck: updatedDeck });
    } catch (e) {
        console.log(e);
        res.status(500).send("Server error");
    }
});

app.patch("/deleteDeck", async (req, res) => {
    const { deckId, userId } = req.body;
    try {
        const deletedDeck = await deck_collection.findByIdAndUpdate(
            deckId,
            { deleteStatus: true },
            { new: true }
        );
        await users_collection.findByIdAndUpdate(userId, {
            $inc: { deckNo: -1 },
        });
        res.json({ status: "deckDeleted", deck: deletedDeck });
    } catch (e) {
        console.log(e);
        res.status(500).send("Server error");
    }
});

app.post("/addCard", async (req, res) => {
    const { deckId, cardName, hint, ans, rating, userId } = req.body;
    try {
        const newCard = {
            deckId,
            cardName,
            hint,
            ans,
            rating,
            createDate: new Date(),
            deleteStatus: false,
            activeStatus: true,
        };
        const result = await card_collection.insertMany([newCard]);
        res.json({ status: "cardAdded", card: result[0] });
        await users_collection.findByIdAndUpdate(userId, {
            $inc: { cardNo: 1 },
        });
    } catch (e) {
        console.log(e);
        res.status(500).send("Server error");
    }
});

app.get("/cards", async (req, res) => {
    const { deckId } = req.query;
    try {
        const cards = await card_collection.find({ deckId, deleteStatus: false }).sort({ rating: -1 });
        res.json(cards);
    } catch (e) {
        console.log(e);
        res.status(500).send("Server error");
    }
});

app.patch("/changeRating/:id", async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;
    try {
        const card = await card_collection.findByIdAndUpdate(id, { rating: value }, { new: true });
        if (!card) {
            return res.status(404).send("CardNotFound");
        }
        res.json("ratingChanged");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.patch("/deleteCard", async (req, res) => {
    const { cardId, userId } = req.body;
    try {
        const deletedCard = await card_collection.findByIdAndUpdate(
            cardId,
            { deleteStatus: true },
            { new: true }
        );
        res.json({ status: "cardDeleted", card: deletedCard });
        await users_collection.findByIdAndUpdate(userId, {
            $inc: { cardNo: -1 },
        });
    } catch (e) {
        console.log(e);
        res.status(500).send("Server error");
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
