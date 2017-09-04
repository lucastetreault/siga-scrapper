const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'http://clients.njoyn.com/CGI/xweb/';

const bearclawJobListings = 'xweb.asp?page=joblisting&CLID=25304';
const dakotaDunesJobListings = 'xweb.asp?page=joblisting&CLID=25167';
const goldEagleJobListings = 'xweb.asp?page=joblisting&CLID=25264';
const livingSkyJobListings = 'XWeb.asp?page=joblisting&clid=25305';
const northernLightsJobListings = 'xweb.asp?page=joblisting&CLID=25265';
const paintedHandsJobListings = 'xweb.asp?page=joblisting&CLID=25303';
const saskatoonJobListings = 'XWeb.asp?page=joblisting&clid=24443';

const jobListings = [
  bearclawJobListings,
  dakotaDunesJobListings,
  goldEagleJobListings,
  livingSkyJobListings,
  northernLightsJobListings,
  paintedHandsJobListings,
  saskatoonJobListings
];

const getLinksToJobListings = async (jobListingUrl) => {
  const jobListing = (await axios(baseUrl + jobListingUrl)).data;
  const $ = cheerio.load(jobListing);
  const links = [];

  try {
    $('#results').find('tr').each(function () {
      let jobDetailsLink = $(this).find('td').filter('.profileLabel').find('a').attr('href');
      if (jobDetailsLink) {
        links.push(jobDetailsLink);
      }
    });
  } catch (e) {

  }
  return links;
};

const getJobDetails = async (jobDetailsUrl) => {
  const jobListing = (await axios(baseUrl + jobDetailsUrl)).data;
  const $ = cheerio.load(jobListing);
  const form = $('form[name="form1"]');

  let jobDetails = { jobTitle: form.find('h3').text() };

  const nodes = form.contents().filter(function () {
    return (this.nodeType == 3 && $(this).text().trim()) || this.name === 'strong' || this.name === 'b';
  });

  let title;
  nodes.map((index, elm) => {
    if (elm.name === 'strong' || elm.name === 'b') {
      title = $(elm).text();
    } else {
      if (jobDetails[title]) {
        jobDetails[title] = jobDetails[title] + '\n' + $(elm).text();
      } else {
        jobDetails[title] = $(elm).text();
      }
    }
  });

  return jobDetails;
};

(async () => {
  const jobDetailsLinks = (await Promise.all(jobListings.map(getLinksToJobListings))).reduce((prev, curr) => prev.concat(curr), []);
  const jobs = await Promise.all(jobDetailsLinks.map(getJobDetails));
  console.log(JSON.stringify(jobs));
})();






