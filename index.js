import { createRequire } from "module";
const require = createRequire(import.meta.url);
import express from "express";
var cors = require("cors");
import multer from "multer";
import bodyParser from "body-parser";
import { saveToIPFS, saveAsJSONToIPFS } from "./ipfs.js";
import fs from "fs";
import { getFilesFromPath } from "web3.storage";

const upload = multer();

const router = express.Router();
const BASE_URL = "/web3_storage";

const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router.post(
  BASE_URL + "/image",
  upload.array("file"),
  cors(),
  async (req, res) => {
    const { name, description } = req.body;
    console.log(req.files, name, description);
    const results = await Promise.all(
      req.files.map(async (item, index) => {
        try {
          let mediaUrl;
          console.log(
            "base 64 string is",
            Buffer.from(item.buffer).toString("base64")?.slice(0, 100)
          );
          const url = Buffer.from(item.buffer).toString("base64");
          let buff = Buffer(url, "base64");
          fs.writeFileSync("graph.png", buff);

          const files = await getFilesFromPath("./graph.png");

          // const res = await fetch(`data:image/png;base64,${url}`);
          // const fileBlob = await res.blob();

          // const file = new File([fileBlob], "File name", { type: "image/png" });
          mediaUrl = await saveToIPFS(files);
          console.log(`https://${mediaUrl}.ipfs.w3s.link/graph.png`);
          const nftMetadata = {
            image: `https://${mediaUrl}.ipfs.w3s.link/graph.png`,
            name,
            description,
          };
          const metadataCid = await saveAsJSONToIPFS(nftMetadata);
          console.log("metadataCid", metadataCid);
          res
            .status(200)
            .send({
              status: true,
              metadata_uri: `https://${metadataCid?.cid}.ipfs.w3s.link/file.json`,
            });
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
