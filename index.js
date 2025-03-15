(async () => {
  const puppeteer = require("puppeteer");
  const nodemailer = require("nodemailer");

  console.log("app started...");
  async function getCookie() {
    // const browser = await puppeteer.launch({ headless: true });
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto("https://ticket.vanillasky.ge/ge/flights-form", {
      waitUntil: "networkidle2",
    });
    const cookies = await page.cookies();
    if (cookies.length > 0) {
      await browser.close();
      console.log(
        "giving you the cookie",
        `${cookies[0].name}=${cookies[0].value}`,
      );
      return `${cookies[0].name}=${cookies[0].value}`;
    } else {
      await browser.close();
      throw new Error("no cookie found");
    }
  }
  async function isDateAvailable(dayOfTheMonth, cookie) {
    return fetch("https://ticket.vanillasky.ge/ge/tickets", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-ua":
          '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        cookie,
        Referer: "https://ticket.vanillasky.ge/ge/tickets",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `types=0&departure=7&date_picker=03%2F${27}%2F2025&arrive=6&date_picker_arrive=03%2F15%2F2025&person_count=3&person_types%5Badult%5D=3&person_types%5Bchild%5D=0&person_types%5Binfant%5D=0&op=&form_build_id=form-MAv1UV_POiTJY5WOUlcC92ZMCZWnTqIHQJnWYMcO8W0&form_id=form_select_date`,
      method: "POST",
    })
      .then((r) => r.text())
      .then((r) => !r.includes("There are no available tickets"));
  }

  async function sendEmail(exactDate) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vazha2121@gmail.com",
        pass: "urej tqmt lpzw lbjc",
      },
    });

    const mailOptions = {
      from: "vazha2121@gmail.com",
      to: "nina.pakhuridze@icloud.com",
      subject: "ARIQA GAFRINDA UKVE",
      text: `${exactDate} aprils daido frena`,
    };

    console.log("about to send email");

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("SENDING EMAIL ERROR");
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }

  async function main() {
    const cookie = await getCookie();
    const datesToCheck = [5, 6, 7, 8, 9, 10];
    for (const date of datesToCheck) {
      const isAvailable = await isDateAvailable(date, cookie);
      if (isAvailable) {
        console.log(`${date} april is available`);
        sendEmail(date);
        return;
      } else {
        console.log("not available");
      }
    }
  }

  await main();
})();
