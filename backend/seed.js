import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Homestay from "./models/Homestay.js";
import Review from "./models/Review.js";
import Booking from "./models/Booking.js";
import Complaint from "./models/Complaint.js";
import VerificationRequest from "./models/VerificationRequest.js";
import { Coupon, Offer, AdCampaign, CmsSeo } from "./models/Marketing.js";
import Notification from "./models/Notification.js";

dotenv.config();

const mockUserImages = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", // Female
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", // Male
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", // Female
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"  // Male
];

export const seedHomestaysData = [
  {
    name: "Trishul Eco-Homestay",
    location: "Ranikhet, Uttarakhand",
    description: "A serene eco-friendly wooden homestay facing the snow-capped Himalayan peaks. Enjoy home-cooked Kumaoni meals and guided nature trails.",
    startingPrice: 3500,
    category: "Mountain",
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600",
      "https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?q=80&w=600"
    ],
    amenities: ["WiFi", "Hot Water", "Kitchen", "Parking", "Mountain View", "Fireplace", "Eco-Toilet"],
    rules: ["No smoking inside the wooden rooms", "Silent hours from 10:00 PM to 6:00 AM", "Keep plastic disposal to a minimum"],
    hostDetails: {
      name: "Devendra Singh",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      bio: "Local mountaineer and conservation enthusiast hosting travelers in Uttarakhand for over 8 years.",
      joined: "May 2018"
    },
    nearbyAttractions: [
      { name: "Chaubatia Tea Gardens", distance: "4.5 km" },
      { name: "Jhula Devi Temple", distance: "2.1 km" },
      { name: "Majkhali Scenic Point", distance: "9.0 km" }
    ],
    questionsAndAnswers: [
      {
        question: "Is there a heater in the rooms?",
        answer: "Yes, we provide traditional charcoal heaters (anghiti) and electric bed warmers upon request.",
        askedBy: "Ananya M.",
        answeredBy: "Devendra Singh"
      },
      {
        question: "Can we access the property by sedan car?",
        answer: "Yes, there is a paved motorable road right up to our parking gate.",
        askedBy: "Rohan D.",
        answeredBy: "Devendra Singh"
      }
    ],
    bookings: [
      { startDate: new Date("2026-07-10"), endDate: new Date("2026-07-14") },
      { startDate: new Date("2026-07-22"), endDate: new Date("2026-07-25") }
    ]
  },
  {
    name: "Goa Beachside Retreat",
    location: "Calangute, Goa",
    description: "Steps away from the sandy shores, this boutique homestay features a private garden, outdoor patio, and fresh seafood cooked daily.",
    startingPrice: 4500,
    category: "Beach",
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600",
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=600",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
      "https://images.unsplash.com/photo-1473116763269-25541579ff6f?q=80&w=600"
    ],
    amenities: ["WiFi", "AC", "Kitchen", "Beach Access", "Pool", "Balcony", "Outdoor Shower"],
    rules: ["Wash sand off before entering the cottage", "No loud music in the garden after 11 PM", "Eco-friendly beach rules"],
    hostDetails: {
      name: "Maria D'Souza",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      bio: "Goan culinary expert who loves sharing traditional vindaloo recipes and secret beach tips with guests.",
      joined: "September 2020"
    },
    nearbyAttractions: [
      { name: "Calangute Beach", distance: "0.2 km" },
      { name: "Aguada Fort", distance: "6.8 km" },
      { name: "Saturday Night Market", distance: "4.0 km" }
    ],
    questionsAndAnswers: [
      {
        question: "Do you offer airport transfers?",
        answer: "Yes, we can arrange a private taxi from Dabolim or Mopa airport for a nominal fee.",
        askedBy: "Sarah P.",
        answeredBy: "Maria D'Souza"
      }
    ],
    bookings: [
      { startDate: new Date("2026-07-05"), endDate: new Date("2026-07-09") }
    ]
  },
  {
    name: "Ooty Heritage Villa",
    location: "Ooty, Tamil Nadu",
    description: "A historic colonial-era bungalow built in 1895, surrounded by lush tea gardens, misty lawns, and cozy stone fireplaces.",
    startingPrice: 5500,
    category: "Heritage",
    images: [
      "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=600",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600",
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=600",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600"
    ],
    amenities: ["WiFi", "Fireplace", "Hot Water", "Tea Garden View", "Lawn Gardens", "Library"],
    rules: ["Do not touch the antique artifacts", "No pets allowed due to historical carpets", "Quiet evening hours"],
    hostDetails: {
      name: "Col. Thomas (Retd.)",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      bio: "Retired Army Colonel passionate about Ooty history, classic literature, and maintaining this heritage property.",
      joined: "March 2017"
    },
    nearbyAttractions: [
      { name: "Ooty Lake", distance: "3.2 km" },
      { name: "Botanical Gardens", distance: "1.8 km" },
      { name: "Doddabetta Peak", distance: "7.5 km" }
    ],
    questionsAndAnswers: [
      {
        question: "Is tea included in the stay?",
        answer: "Yes, we serve freshly brewed Ooty Nilgiri tea every morning and evening complimentary.",
        askedBy: "Vikas K.",
        answeredBy: "Col. Thomas (Retd.)"
      }
    ],
    bookings: [
      { startDate: new Date("2026-07-15"), endDate: new Date("2026-07-18") }
    ]
  },
  {
    name: "Coorg Coffee Estate Cottage",
    location: "Madikeri, Coorg",
    description: "Wake up to the aroma of coffee in this charming wooden cottage nestled within a 20-acre private Robusta estate.",
    startingPrice: 4000,
    category: "Farm Stay",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600",
      "https://images.unsplash.com/photo-1472224371017-08207f84aaae?q=80&w=600",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600",
      "https://images.unsplash.com/photo-1598977123418-45f04b615ad9?q=80&w=600"
    ],
    amenities: ["WiFi", "Kitchen", "Estate Tour", "Hot Water", "Pet Friendly", "Bonfire", "Veranda"],
    rules: ["Pets must be kept leashed during estate walks", "No littering on the coffee paths", "Bonfire requires prior notice"],
    hostDetails: {
      name: "Kariappa B.",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      bio: "Second generation coffee planter who loves conducting walks and teaching guests the art of coffee bean roasting.",
      joined: "January 2019"
    },
    nearbyAttractions: [
      { name: "Abbey Falls", distance: "5.0 km" },
      { name: "Raja's Seat", distance: "2.8 km" },
      { name: "Madikeri Fort", distance: "2.5 km" }
    ],
    questionsAndAnswers: [],
    bookings: []
  },
  {
    name: "Munnar Lakefront Cabin",
    location: "Munnar, Kerala",
    description: "A cozy A-frame cabin overlooking the peaceful waters of Mattupetty Lake. Watch wild elephants drink at dawn from your balcony.",
    startingPrice: 3800,
    category: "Lake View",
    images: [
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
      "https://images.unsplash.com/photo-1433832597046-4f10e10ac764?q=80&w=600"
    ],
    amenities: ["WiFi", "Hot Water", "Balcony", "Boating Access", "Outdoor Seating", "Electric Kettle"],
    rules: ["Do not feed the wild animals near the lake", "No loud speakers in the balcony", "Check-out by 11:00 AM"],
    hostDetails: {
      name: "Anil Kumar",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      bio: "Former naturalist and trekking guide who can set up personalized spice plantation walks for you.",
      joined: "November 2021"
    },
    nearbyAttractions: [
      { name: "Mattupetty Dam", distance: "1.2 km" },
      { name: "Eravikulam National Park", distance: "12.0 km" },
      { name: "Anamudi Peak", distance: "15.0 km" }
    ],
    questionsAndAnswers: [],
    bookings: []
  },
  {
    name: "Himalayan Luxury Chalet",
    location: "Manali, Himachal Pradesh",
    description: "Indulge in absolute luxury with an indoor heated plunge pool, premium pine wood architecture, and panoramic views of the Solang Valley.",
    startingPrice: 9500,
    category: "Luxury",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=600",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600"
    ],
    amenities: ["WiFi", "Heated Plunge Pool", "AC", "Private Chef Available", "Smart TV", "Bathtub", "Luxury Linens", "Gym Access"],
    rules: ["No parties or commercial video shoots without approval", "Strictly no drugs", "Heated pool use till 9 PM"],
    hostDetails: {
      name: "Rohit Sharma",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      bio: "Hotelier and adventure sports lover who provides curated heli-skiing and premium paragliding packages.",
      joined: "June 2022"
    },
    nearbyAttractions: [
      { name: "Solang Valley", distance: "5.5 km" },
      { name: "Hadimba Temple", distance: "4.0 km" },
      { name: "Rohtang Pass", distance: "42.0 km" }
    ],
    questionsAndAnswers: [
      {
        question: "Is there a dedicated chef at the villa?",
        answer: "Yes, we have an in-house chef specializing in Indian, Italian, and local Himachali cuisines (charges per meal/day).",
        askedBy: "Preeti S.",
        answeredBy: "Rohit Sharma"
      }
    ],
    bookings: [
      { startDate: new Date("2026-07-01"), endDate: new Date("2026-07-04") }
    ]
  },
  {
    name: "Araku Valley Budget Stay",
    location: "Araku Valley, Andhra Pradesh",
    description: "Affordable, clean, and comfortable homestay close to the Araku Tribal Museum. Experience tribal culture and local bamboo chicken cuisine.",
    startingPrice: 1800,
    category: "Budget",
    images: [
      "https://images.unsplash.com/photo-1564507592937-25994a9015ba?q=80&w=600",
      "https://images.unsplash.com/photo-1520277427644-86e7e12c7e80?q=80&w=600",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=600",
      "https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=600"
    ],
    amenities: ["WiFi", "Hot Water", "Local Guide Book", "Ceiling Fan", "Common Kitchen Access"],
    rules: ["Submit Government ID card at check-in", "No alcohol in common dining area", "Save water during summer months"],
    hostDetails: {
      name: "Ramu Prasad",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      bio: "Araku local guide who has lived here his entire life. Happy to show you around the coffee plantation trails.",
      joined: "December 2021"
    },
    nearbyAttractions: [
      { name: "Araku Tribal Museum", distance: "0.8 km" },
      { name: "Borra Caves", distance: "34.0 km" },
      { name: "Padmapuram Gardens", distance: "2.2 km" }
    ],
    questionsAndAnswers: [],
    bookings: []
  },
  {
    name: "Hyderabad Tech City Haven",
    location: "Gachibowli, Hyderabad",
    description: "Modern, quiet, and top-rated studio apartment homestay. Perfect for business trips or couples looking for a premium stay near the IT corridor.",
    startingPrice: 3200,
    category: "Top Rated",
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=600",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600"
    ],
    amenities: ["WiFi", "AC", "Kitchen", "Gym Access", "Smart TV", "Washing Machine", "Elevator", "Power Backup"],
    rules: ["No parties or loud noises inside the residential society", "No pets allowed", "Smoking restricted to balcony only"],
    hostDetails: {
      name: "Deepthi K.",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      bio: "Software professional and travel blogger hosting corporate guests and families in Hyderabad.",
      joined: "August 2023"
    },
    nearbyAttractions: [
      { name: "Shilparamam Crafts Village", distance: "3.5 km" },
      { name: "IKEA Store Hyderabad", distance: "2.8 km" },
      { name: "Golconda Fort", distance: "9.2 km" }
    ],
    questionsAndAnswers: [
      {
        question: "Is there high-speed fiber internet?",
        answer: "Yes, we have a 150 Mbps Airtel fiber connection, ideal for remote work.",
        askedBy: "Sunil G.",
        answeredBy: "Deepthi K."
      }
    ],
    bookings: [
      { startDate: new Date("2026-07-06"), endDate: new Date("2026-07-08") }
    ]
  }
];

export const seedReviewsData = [
  {
    id: "1",
    date: "June 18, 2026",
    source: "Airbnb",
    text: "The Himalayan peaks were visible right from the wooden balcony! Exceeded expectations.",
    sentiment: "Positive",
    theme: "Location",
    score: 95,
    response: "The Himalayan mountain views are indeed breathtaking! We are thrilled you enjoyed the wooden balcony views.",
    overallRating: 5,
    ratings: { cleanliness: 5, hospitality: 5, food: 4, location: 5, value: 5, comfort: 5, wifi: 4, safety: 5 },
    travelType: "Couple",
    stayedDuring: "2026-06",
    recommend: true
  },
  {
    id: "2",
    date: "June 17, 2026",
    source: "Booking.com",
    text: "Food was highly delicious and fresh, but room cleaning was done late in the afternoon.",
    sentiment: "Neutral",
    theme: "Food",
    score: 72,
    response: "Thank you for praising our local cuisine! We will adjust our cleanliness timings to ensure room updates occur earlier.",
    overallRating: 3,
    ratings: { cleanliness: 2, hospitality: 4, food: 5, location: 4, value: 3, comfort: 3, wifi: 3, safety: 4 },
    travelType: "Family",
    stayedDuring: "2026-06",
    recommend: true
  },
  {
    id: "3",
    date: "June 15, 2026",
    source: "Google",
    text: "The hosts treated us like their own family. Extremely warm gestures and local insights.",
    sentiment: "Positive",
    theme: "Host",
    score: 98,
    response: "Thank you so much! Our hosts strive to provide a warm, personalized family experience for every guest.",
    overallRating: 5,
    ratings: { cleanliness: 4, hospitality: 5, food: 5, location: 4, value: 5, comfort: 5, wifi: 4, safety: 5 },
    travelType: "Solo",
    stayedDuring: "2026-06",
    recommend: true
  },
  {
    id: "4",
    date: "June 14, 2026",
    source: "Airbnb",
    text: "Water heater wasn't working on the first day, took several hours to fix.",
    sentiment: "Negative",
    theme: "Cleanliness",
    score: 41,
    response: "We apologize sincerely for the hot water issue. We have fixed the heater unit immediately with our technician.",
    overallRating: 2,
    ratings: { cleanliness: 3, hospitality: 3, food: 4, location: 4, value: 2, comfort: 2, wifi: 4, safety: 4 },
    travelType: "Friends",
    stayedDuring: "2026-06",
    recommend: false
  },
  {
    id: "5",
    date: "June 10, 2026",
    source: "Booking.com",
    text: "Lovely wooden cottage feel, but the room cost was a bit steep compared to other homestays nearby.",
    sentiment: "Neutral",
    theme: "Value",
    score: 65,
    response: "Thank you for your feedback regarding our rates. We strive to offer unique eco-stays and are continuously enhancing our facilities to provide better value.",
    overallRating: 3,
    ratings: { cleanliness: 4, hospitality: 4, food: 4, location: 4, value: 3, comfort: 4, wifi: 3, safety: 4 },
    travelType: "Couple",
    stayedDuring: "2026-06",
    recommend: true
  },
  {
    id: "6",
    date: "June 08, 2026",
    source: "Google",
    text: "Wonderful service! The caretaker took us on a guided village walk. Will visit again.",
    sentiment: "Positive",
    theme: "Host",
    score: 96,
    response: "Namaskar! Thank you so much. Our hosts strive to provide a warm, personalized family experience for every guest.",
    overallRating: 5,
    ratings: { cleanliness: 5, hospitality: 5, food: 5, location: 4, value: 5, comfort: 5, wifi: 3, safety: 5 },
    travelType: "Friends",
    stayedDuring: "2026-06",
    recommend: true
  }
];

export const seedDatabase = async () => {
  try {
    // 1. Clear database
    console.log("[Seed] Clearing collections...");
    await Review.deleteMany({});
    await Homestay.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    await Complaint.deleteMany({});
    await VerificationRequest.deleteMany({});
    await Coupon.deleteMany({});
    await Offer.deleteMany({});
    await AdCampaign.deleteMany({});
    await Notification.deleteMany({});
    await CmsSeo.deleteMany({});

    // 2. Create staff, admin, and owner users
    console.log("[Seed] Creating default users...");
    const staffUser = await User.create({
      name: "Trishul Staff",
      email: "staff@trishul.com",
      password: "staff123",
      role: "Staff"
    });

    const adminUser = await User.create({
      name: "Trishul Admin",
      email: "admin@trishul.com",
      password: "admin123",
      role: "Admin"
    });

    const ownerUser = await User.create({
      name: "Devendra Singh (Owner)",
      email: "owner@trishul.com",
      password: "owner123",
      role: "Owner"
    });

    // 3. Create all 8 homestays
    console.log("[Seed] Inserting homestays...");
    const homestaysWithOwners = seedHomestaysData.map((h, idx) => ({
      ...h,
      owner: idx === 0 ? ownerUser._id : (idx % 2 === 1 ? staffUser._id : adminUser._id)
    }));
    const createdHomestays = await Homestay.insertMany(homestaysWithOwners);
    console.log(`[Seed] Created ${createdHomestays.length} homestays.`);

    // 4. Match the 6 default reviews to Trishul Eco-Homestay (index 0)
    console.log("[Seed] Inserting detailed reviews linked to Trishul Eco-Homestay...");
    const trishulHomestay = createdHomestays[0];
    const reviewsWithRelations = seedReviewsData.map((r, idx) => ({
      ...r,
      respondedBy: ownerUser._id,
      homestay: trishulHomestay._id,
      helpfulVotes: idx * 3 + 1,
      spamScore: idx === 3 ? 84 : 12, // Review #4 (heater issue) has high fake probability for testing
      isVerifiedStay: idx !== 4
    }));

    await Review.insertMany(reviewsWithRelations);
    
    // 5. Update Trishul Homestay ratings summary
    const totalRatingSum = seedReviewsData.reduce((sum, r) => sum + r.overallRating, 0);
    trishulHomestay.rating = parseFloat((totalRatingSum / seedReviewsData.length).toFixed(1));
    trishulHomestay.reviewsCount = seedReviewsData.length;
    trishulHomestay.aiReviewSummary = "Guests consistently praise the gorgeous wooden balconies with direct mountain vistas, delicious organic Kumaoni cuisine, and the hosts' exceptional hospitality. However, a few minor issues regarding initial wifi connection dropouts and late afternoon housekeeping timings were noted.";
    await trishulHomestay.save();

    // 6. Seed mock reviews for other homestays to make ratings render nicely
    console.log("[Seed] Seeding sample reviews for remaining homestays...");
    let nextId = 7;
    for (let i = 1; i < createdHomestays.length; i++) {
      const homestay = createdHomestays[i];
      const count = 1 + Math.floor(Math.random() * 2); // 1 or 2 reviews
      let ratingSum = 0;

      for (let j = 0; j < count; j++) {
        const rating = 4 + Math.floor(Math.random() * 2); // 4 or 5 star review
        ratingSum += rating;

        await Review.create({
          id: String(nextId++),
          date: "June 25, 2026",
          source: "Direct Feedback",
          text: `Extremely wonderful homestay. The location in ${homestay.location.split(",")[0]} was beautiful, amenities were spot on, and the host was very friendly.`,
          sentiment: "Positive",
          theme: "Host",
          score: 95,
          overallRating: rating,
          ratings: { cleanliness: rating, hospitality: 5, food: 4, location: 5, value: rating, comfort: 5, wifi: 4, safety: 5 },
          travelType: "Couple",
          stayedDuring: "2026-06",
          recommend: true,
          homestay: homestay._id,
          helpfulVotes: j * 4 + 2,
          spamScore: 8,
          isVerifiedStay: true
        });
      }

      homestay.rating = parseFloat((ratingSum / count).toFixed(1));
      homestay.reviewsCount = count;
      homestay.aiReviewSummary = `This property is highly recommended for its excellent location in ${homestay.location.split(",")[0]}, outstanding cleanliness, and the host's helpful hospitality during the stay.`;
      await homestay.save();
    }

    // 7. Seed Bookings
    console.log("[Seed] Seeding bookings...");
    const bookings = [
      {
        homestay: createdHomestays[0]._id,
        guestName: "Aarav Mehta",
        guestEmail: "aarav.mehta@gmail.com",
        startDate: new Date("2026-07-01"),
        endDate: new Date("2026-07-04"),
        totalAmount: 10500,
        status: "Completed",
        guestsCount: 2
      },
      {
        homestay: createdHomestays[0]._id,
        guestName: "Ananya Sen",
        guestEmail: "ananya.sen@gmail.com",
        startDate: new Date("2026-07-10"),
        endDate: new Date("2026-07-14"),
        totalAmount: 14000,
        status: "Confirmed",
        guestsCount: 2
      },
      {
        homestay: createdHomestays[0]._id,
        guestName: "Kabir Roy",
        guestEmail: "kabir.roy@gmail.com",
        startDate: new Date("2026-07-22"),
        endDate: new Date("2026-07-25"),
        totalAmount: 10500,
        status: "Pending",
        guestsCount: 1
      },
      {
        homestay: createdHomestays[1]._id,
        guestName: "Vikram Malhotra",
        guestEmail: "vikram@gmail.com",
        startDate: new Date("2026-07-05"),
        endDate: new Date("2026-07-09"),
        totalAmount: 18000,
        status: "Confirmed",
        guestsCount: 3
      }
    ];
    await Booking.insertMany(bookings);

    // 8. Seed Complaints
    console.log("[Seed] Seeding complaints...");
    const complaints = [
      {
        guestName: "Rohan Das",
        guestEmail: "rohan.das@gmail.com",
        homestay: createdHomestays[0]._id,
        issue: "WiFi connection dropouts in the wooden attic room.",
        status: "Pending"
      },
      {
        guestName: "Sarah Patel",
        guestEmail: "sarah.patel@gmail.com",
        homestay: createdHomestays[1]._id,
        issue: "AC remote batteries were dead upon arrival.",
        status: "Resolved",
        resolutionNotes: "AC batteries replaced by caretaker within 10 minutes of booking request."
      }
    ];
    await Complaint.insertMany(complaints);

    // 9. Seed Verification Requests
    console.log("[Seed] Seeding verification requests...");
    const verifications = [
      {
        owner: ownerUser._id,
        propertyName: "Trishul Eco-Homestay",
        status: "Approved",
        comments: "National ID and Property Ownership Registry deed documents verified."
      },
      {
        owner: staffUser._id,
        propertyName: "Goa Beachside Retreat",
        status: "Pending",
        comments: "Pending local municipality guest license copy submission."
      }
    ];
    await VerificationRequest.insertMany(verifications);

    // 10. Seed Notifications
    console.log("[Seed] Seeding notifications...");
    const notifications = [
      {
        recipient: ownerUser._id,
        message: "New booking request received from Kabir Roy for July 22 - July 25.",
        type: "booking"
      },
      {
        recipient: ownerUser._id,
        message: "Guest Aarav Mehta left a 5-star review: 'The Himalayan peaks were visible...'",
        type: "review"
      },
      {
        recipient: ownerUser._id,
        message: "Your host identity verification has been Approved by Admin.",
        type: "system"
      }
    ];
    await Notification.insertMany(notifications);

    // 11. Seed Coupons & Offers
    console.log("[Seed] Seeding Coupons & Offers...");
    await Coupon.create({
      code: "TRISHUL20",
      discountPercentage: 20,
      validityDate: new Date("2026-12-31"),
      minSpend: 5000
    });

    await Offer.create({
      title: "Himalayan Monsoon Special Offer",
      description: "Book 3 nights and get a complimentary local Kumaoni organic lunch trail.",
      discountRate: 15,
      validityDate: new Date("2026-08-31"),
      homestay: createdHomestays[0]._id
    });

    // 12. Seed Ad Campaigns
    console.log("[Seed] Seeding Ad campaigns...");
    await AdCampaign.create({
      homestay: createdHomestays[0]._id,
      promoSlot: "Homepage Banner Carousel",
      budget: 5000,
      isActive: true
    });
    await AdCampaign.create({
      homestay: createdHomestays[1]._id,
      promoSlot: "Search Results Promoted Top",
      budget: 3500,
      isActive: false
    });

    // 13. Seed CMS & SEO
    console.log("[Seed] Seeding CMS & SEO configs...");
    await CmsSeo.create({
      homepageHeroTitle: "Discover Authentic Homestays in the Heart of India",
      homepageHeroSubtitle: "Book local eco-homestays with real-time feedback ratings, validated hospitality, and home-cooked regional delicacies.",
      metaTitle: "Trishul Eco-Homestays - Guest Review Sentiment Classifier",
      metaDescription: "AI-assisted feedback analysis, theme tagging, and automated management responses."
    });

    console.log("[Seed] Successfully seeded all collections!");
  } catch (error) {
    console.error(`[Seed Error] Seeding failed: ${error.message}`);
    throw error;
  }
};

if (process.argv[1] && (process.argv[1].endsWith("seed.js") || process.argv[1].includes("seed"))) {
  const runSeed = async () => {
    try {
      const mongoURI = process.env.MONGO_URI;
      if (!mongoURI) {
        throw new Error("MONGO_URI not defined in environment.");
      }
      console.log(`[Seed] Connecting to: ${mongoURI}`);
      await mongoose.connect(mongoURI);
      await seedDatabase();
      await mongoose.connection.close();
      console.log("[Seed] Connection closed.");
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  runSeed();
}
