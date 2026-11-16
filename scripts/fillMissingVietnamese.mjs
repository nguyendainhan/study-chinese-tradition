import fs from 'fs';
import path from 'path';

const filePath = path.resolve('public/tocfl_8000_full.json');
const backupPath = path.resolve('public/tocfl_8000_full.backup.json');

const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);

// Create backup
fs.writeFileSync(backupPath, raw);
console.log('Created backup at', backupPath);

const allWords = data.words;
const missingIndices = [];

for (let i = 0; i < allWords.length; i++) {
  const w = allWords[i];
  if (!w.vietnamese || !w.vietnamese.trim()) {
    missingIndices.push(i);
  }
}

console.log(`Total words: ${allWords.length}`);
console.log(`Missing Vietnamese: ${missingIndices.length}`);

async function translateBatch(wordsToTranslate) {
  const text = wordsToTranslate.join('\n');
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-TW&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  const json = await res.json();
  const fullText = json[0].map((x) => x[0]).join('');
  const lines = fullText.split('\n').map((s) => s.trim());
  return lines;
}

const BATCH_SIZE = 40;

async function run() {
  let successCount = 0;

  for (let i = 0; i < missingIndices.length; i += BATCH_SIZE) {
    const chunkIndices = missingIndices.slice(i, i + BATCH_SIZE);
    const chunkWords = chunkIndices.map((idx) => allWords[idx].traditional || allWords[idx].rawWord);

    try {
      const translatedLines = await translateBatch(chunkWords);
      for (let j = 0; j < chunkIndices.length; j++) {
        const wordIdx = chunkIndices[j];
        const trans = translatedLines[j] || '';
        if (trans) {
          allWords[wordIdx].vietnamese = trans;
          successCount++;
        }
      }
      console.log(
        `[${Math.min(i + BATCH_SIZE, missingIndices.length)}/${missingIndices.length}] Translated batch of ${chunkIndices.length} words...`
      );
    } catch (err) {
      console.error(`Error translating batch at ${i}:`, err.message);
      // Fallback: translate 1 by 1
      for (const wordIdx of chunkIndices) {
        try {
          const singleTrad = allWords[wordIdx].traditional || allWords[wordIdx].rawWord;
          const [singleTrans] = await translateBatch([singleTrad]);
          if (singleTrans) {
            allWords[wordIdx].vietnamese = singleTrans;
            successCount++;
          }
        } catch {
          // ignore
        }
      }
    }

    // Delay 250ms to respect rate limits
    await new Promise((r) => setTimeout(r, 250));

    // Save checkpoint every 500 words
    if ((i + BATCH_SIZE) % 400 === 0 || i + BATCH_SIZE >= missingIndices.length) {
      data.words = allWords;
      fs.writeFileSync(filePath, JSON.stringify(data));
      console.log(`--> Saved progress checkpoint to ${filePath}`);
    }
  }

  data.words = allWords;
  fs.writeFileSync(filePath, JSON.stringify(data));
  console.log(`\nDONE! Successfully filled ${successCount} Vietnamese translations!`);
  const stillMissing = allWords.filter((w) => !w.vietnamese || !w.vietnamese.trim()).length;
  console.log(`Remaining words without Vietnamese: ${stillMissing}`);
}

run();
