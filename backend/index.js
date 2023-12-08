const express = require('express');
const app = express();
const webdriver = require('selenium-webdriver');
const { By, until } = webdriver;
const jsonfile = require('jsonfile');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const { Builder, Capabilities } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

// Set up options for Firefox in headless mode
const firefoxOptions = new firefox.Options();
firefoxOptions.headless();

// Use the options when building the WebDriver
const driver = new Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(firefoxOptions)
  .build();

// Function to scrape Flipkart job details
async function scrapeFlipkartJobs(x) {
  // ... (Flipkart scraping logic, as provided earlier)
  try {
    const job_data = [];
    
    // Navigate to Flipkart based on user input 'x'
    await driver.get(`https://www.flipkart.com/search?q=${x}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&sort=price_desc`);

    // Wait for the job list to load
    await driver.wait(until.elementLocated(By.css('._1YokD2')), 10000);

    let cnt = 0;
    const MAX_JOBS = 10;

    while (cnt < MAX_JOBS) {
      const job_elements = await driver.findElements(By.css('._1xHGtK'));

      for (const job_element of job_elements) {
        try {
          const job_title_element = await job_element.findElement(By.css('._2B099V > a'));
          const job_title = await job_title_element.getText();

          const location_element = await job_element.findElement(By.css('._30jeq3'));
          const job_location = await location_element.getText();

          const image_element = await job_element.findElement(By.css('._2r_T1I'));
          const image_src = await image_element.getAttribute('src');

          job_data.push({
            Title: job_title.trim(),
            Location: job_location.trim(),
            Image: image_src
          });

          cnt++;

          if (cnt >= MAX_JOBS) break;
        } catch (error) {
          console.error('Error scraping job details:', error);
        }
      }

      const next_button = await driver.findElements(By.css('._1LKTO3'));
      if (next_button.length > 1) {
        await next_button[1].click();
      } else {
        await next_button[0].click();
      }

      await driver.wait(until.stalenessOf(job_elements[0]), 10000);
    }

    return job_data;
  } catch (error) {
    console.error('Error scraping:', error);
    throw error;
  }
}

// Function to scrape Myntra shoe details
async function scrapeMyntraShoes(x) {
  // ... (Myntra scraping logic, as provided earlier)
  try {
    const shoe_data = [];
    
    await driver.get(`https://www.myntra.com/{pd}?rawQuery={pd}&sort=price_asc`.replace(/{pd}/g, x));

    await driver.wait(until.elementLocated(By.css(".search-searchProductsContainer")), 10000);

    let cnt = 0;
    const MAX_SHOES = 10;

    while (cnt < MAX_SHOES) {
      const shoe_elements = await driver.findElements(By.css(".product-base"));

      for (const shoe_element of shoe_elements) {
        try {
          const shoe_title_element = await shoe_element.findElement(By.css('.product-product'));
          const shoe_title = await shoe_title_element.getText();

          const location_element = await shoe_element.findElement(By.css(".product-price"));
          const shoe_location = await location_element.getText();

          const image_element = await shoe_element.findElement(By.css("img.img-responsive"));
          const image_src = await image_element.getAttribute("src");

          shoe_data.push({
            Title: shoe_title.trim(),
            Location: shoe_location.trim(),
            Image: image_src
          });

          cnt++;

          if (cnt >= MAX_SHOES) break;
        } catch (error) {
          console.error('Error scraping shoe details:', error);
        }
      }

      const next_button = await driver.findElements(By.css('.pagination-next>a'));
      if (next_button.length > 1) {
        await next_button[1].click();
      } else {
        await next_button[0].click();
      }

      await driver.wait(until.stalenessOf(shoe_elements[0]), 10000);
  
      // Handle Pagination - Uncomment below lines after implementing pagination logic
      // const next_button = await driver.findElement(By.css('.pagination-next > a'));
      // await next_button.click();

      // await driver.wait(until.stalenessOf(shoe_elements[0]), 10000);
    }

    return shoe_data;
  } catch (error) {
    console.error('Error scraping Myntra:', error);
    throw error;
  }
}

// Function to scrape Ajio shoe details
async function scrapeAjioShoes(x) {
  // ... (Ajio scraping logic, as provided earlier)
  try {
    const shoe_data = [];
    
    await driver.get(`https://www.ajio.com/search/?query=%3Aprce-asc&text=${x}&classifier=intent&gridColumns=3`);

    await driver.wait(until.elementLocated(By.css(".items")), 10000);

    let cnt = 0;
    const MAX_SHOES = 10;

    while (cnt < MAX_SHOES) {
      // Add a delay to allow content to load after scrolling
      await driver.sleep(5000);

      const shoe_elements = await driver.findElements(By.css(".item"));

      for (const shoe_element of shoe_elements) {
        try {
          const shoe_title_element = await shoe_element.findElement(By.css('.nameCls'));
          const shoe_title = await shoe_title_element.getText();

          const location_element = await shoe_element.findElement(By.css(".price"));
          const shoe_location = await location_element.getText();

          const image_element = await shoe_element.findElement(By.css(".rilrtl-lazy-img-loaded"));
          const image_src = await image_element.getAttribute("src");

          shoe_data.push({
            Title: shoe_title.trim(),
            Location: shoe_location.trim(),
            Image: image_src
          });

          cnt++;

          if (cnt >= MAX_SHOES) break;
        } catch (error) {
          console.error('Error scraping shoe details:', error);
        }
      }

      // Handle Pagination - Uncomment below lines after implementing pagination logic
      // const next_button = await driver.findElement(By.css('.pagination-next > a'));
      // await next_button.click();

      // await driver.wait(until.stalenessOf(shoe_elements[0]), 10000);
    }

    return shoe_data;
  } catch (error) {
    console.error('Error scraping Ajio:', error);
    throw error;
  }
}

// Set up middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Handle POST request for scraping data
app.post('/scrape', async (req, res) => {
  const { x } = req.body;

  try {
    const scrapedDataFlipkart = await scrapeFlipkartJobs(x);
    const scrapedDataMyntra = await scrapeMyntraShoes(x);
    const scrapedDataAjio = await scrapeAjioShoes(x);

    // Save scraped data to respective files (or send it back to the front-end)
    jsonfile.writeFile('Flipkart.json', scrapedDataFlipkart, { spaces: 4 }, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving Flipkart data' });
      }
    });

    jsonfile.writeFile('Myntra.json', scrapedDataMyntra, { spaces: 4 }, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving Myntra data' });
      }
    });

    jsonfile.writeFile('Ajio_shoes.json', scrapedDataAjio, { spaces: 4 }, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving Ajio data' });
      }
    });

    res.json({ message: 'Data scraped and saved successfully!' });
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({ error: 'Error scraping data' });
  }
});

// Handle GET request to retrieve scraped data
app.get('/scrapedData', async (req, res) => {
  try {
    const scrapedDataFlipkart = await jsonfile.readFile('Flipkart.json');
    const scrapedDataMyntra = await jsonfile.readFile('Myntra.json');
    const scrapedDataAjio = await jsonfile.readFile('Ajio_shoes.json');

    const allScrapedData = {
      Flipkart: scrapedDataFlipkart,
      Myntra: scrapedDataMyntra,
      Ajio: scrapedDataAjio
    };

    res.json(allScrapedData);
  } catch (error) {
    console.error('Error retrieving scraped data:', error);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});