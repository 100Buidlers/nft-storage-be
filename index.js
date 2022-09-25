import { createRequire } from "module";
const require = createRequire(import.meta.url);
import express from "express";
var cors = require("cors");
import multer from "multer";
import bodyParser from "body-parser";
import { saveToIPFS } from "./ipfs.js";

const upload = multer();

const router = express.Router();
const BASE_URL = "/web3_storage";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router.post(
  BASE_URL + "/image",
  upload.array("file"),
  cors(),
  async (req, res) => {
    const { name, description } = req.body;
    console.log(req.files);
    const results = await Promise.all(
      req.files.map(async (item, index) => {
        try {
          let mediaUrl;
          console.log(Buffer.from(item.buffer).toString("base64"));
          mediaUrl = await saveToIPFS(
            `data:image/gif;base64,${Buffer.from(item.buffer).toString(
              "base64"
            )}`
          );
          console.log(`https://${mediaUrl}.ipfs.w3s.link`);
        } catch (error) {
          console.log("error", error);
          throw error;
        }
      })
    );
    // res.status(200).send({ data: results, success: true });
  }
);

router.get(BASE_URL + "/ping", cors(), async (req, res) => {
  res.status(200).send({ status: `true` });
});

app.use(express.json());
app.use(cors());

app.use("/", router);

app.listen(port, () => {
  console.log(`Ipfs Uploader listening on port ${port}`);
});
