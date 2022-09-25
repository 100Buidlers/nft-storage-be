import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { Web3Storage, File, Blob } from "web3.storage";

// const { Web3Storage, File } = require("web3.storage");

const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDA5NDg2MjA3NDAxMjJDOTFkZWNlNzUwRDFEMDhFM0ZFOEUwMDQ1MDEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjEyODExMjU4MTEsIm5hbWUiOiJ3ZWIzLXRlc3QifQ.Ja5fln0-MAU2H4dmNuq2i3RQ-VXzKpl9RH-By2bcvkw";

const client = new Web3Storage({ token: API_KEY });
const data = {
  name: "token name",
  description: "description of the token or proposal title",
  contributions: [
    {
      contributionTitle: "title 1",
      contributionXP: 100,
    },
  ],
};

export const saveToIPFS = async (data, fileName) => {
  // const files = await getFilesFromPath(data);
  // const files = [new File([data], fileName)];

  //   var blob = new Blob([data], { type: "image/jpeg" });
  const rootCid = await client.put(data);
  //   console.log("root cid", rootCid);
  return rootCid;
};

export const saveAsJSONToIPFS = async (data) => {
  const buffer = Buffer.from(JSON.stringify(data));
  const files = [new File([buffer], "file.json")];
  const rootCid = await client.put(files);
  return {
    success: true,
    cid: rootCid,
  };
};

export const appendContribution = async (
  oldContributionCid,
  contributionData
) => {
  try {
    console.log("old contri cid", oldContributionCid);
    const res = await client.get(oldContributionCid);
    console.log(
      "res in append",
      res.status,
      res.statusText,
      res.statusText === "OK"
    );
    if (res.statusText === "OK") {
      const files = await res.files(); // Web3File[]
      for (const file of files) {
        console.log(`${file.cid} ${file.name} ${file.size}`);
        console.log("file is", file);
        const text = await file.text();
        const oldContributions = JSON.parse(text);
        // const contributions = oldMetadata.contributions;
        console.log("file data", oldContributions);
        oldContributions.push({
          ...contributionData,
        });
        const hash = await saveAsJSONToIPFS([...oldContributions]);
        return {
          success: true,
          cid: hash.cid,
        };
      }
    }
    return {
      success: false,
      cid: null,
    };
  } catch (err) {
    console.error("err", err);
    return {
      success: false,
      cid: null,
    };
  }
};

export const proposalNFTMetadata = async (proposalInfo) => {
  const nftSvg = buildProposalNFTSvg(proposalInfo);
  const nftSvgCid = await saveToIPFS(nftSvg, "nftSvg.svg");
  console.log("nftSvg cid", nftSvgCid);
  const nftMetadata = {
    ...proposalInfo,
    name: proposalInfo?.title,
    description: proposalInfo?.description,
    image: `https://${nftSvgCid}.ipfs.w3s.link/nftSvg.svg`,
  };
  const metadataCid = await saveAsJSONToIPFS(nftMetadata);
  console.log("metadata cid", metadataCid?.cid);
  return metadataCid?.cid;
};
