import { Event } from "../models/event.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary,deleteOnCloudinary } from "../utils/cloudinary.js";
import { getResponse } from "../utils/gemini.js";

const createEvent = asyncHandler(async (req, res) => {
  const { title, time, location, date, description } = req.body || {};
  if (!title || !time || !location || !date || !description) {
    throw new ApiError(400, "All fields are Complusory");
  }

  const bannerLocalPath = req.file?.path;
  if (!bannerLocalPath) {
    throw new ApiError(400, "Kindly upload banner also");
  }

  const banner = await uploadOnCloudinary(bannerLocalPath);
  if (!banner.url) {
    throw new ApiError(500, "Something went wrong while uploading on cloudinary");
  }

  const EVENT_PROMPT_TEMPLATES = {
    event_formatter: `
      You will receive raw event fields: title, date, time, location, description.

      Task:
      - Correct spelling and grammar in all fields.
      - Extract structured information from the description to populate all event schema fields.
      - Return a valid JSON object with exactly these fields (and no others):
        "title", "description", "date", "time", "location", "mode", "organizer", "speaker", "tags", "status".

      Rules:
      - "date" must be in ISO format YYYY-MM-DD if unambiguous.
      - "time" must be in 24-hour HH:MM if unambiguous.
      - "tags" must always be an array of strings (empty array if none found).
      - "mode" must be one of ["Offline", "Online", "Hybrid"] (default: "Offline" if unclear).
      - "status" must be one of ["Upcoming", "Ongoing", "Completed", "Cancelled"] (default: "Upcoming").
      - "organizer" must be extracted if mentioned. If not found, set as "".
      - "speaker" must be extracted if mentioned. If not found, set as "".
      - Trim whitespace from all fields.
      - Do not invent facts. Only extract from the given input.
      - If information is missing, leave it empty ("" or []), except "mode" and "status" which must always have defaults.
      - Output ONLY the JSON object, no extra text.

      Example Input:
      title: {title}
      date: {date}
      time: {time}
      location: {location}
      description: {description}

      Example Output:
      {
        "title": "AI Workshop on Machine Learning",
        "description": "A hands-on session introducing machine learning concepts with live coding examples. Organized by the Faculty of Technology, Delhi University. Speaker: Dr. Ankit Sharma.",
        "date": "2025-09-15",
        "time": "14:00",
        "location": "Seminar Hall, Faculty of Technology, DU",
        "mode": "Offline",
        "organizer": "Faculty of Technology, Delhi University",
        "speaker": "Dr. Ankit Sharma",
        "tags": ["AI", "Machine Learning", "Workshop"],
        "status": "Upcoming"
      }

      Important: Return ONLY a valid JSON object. Do not include any explanations, notes, or text outside the JSON.
    `,
  };

  const prompt = EVENT_PROMPT_TEMPLATES.event_formatter
    .replace("{title}", title || "")
    .replace("{date}", date || "")
    .replace("{time}", time || "")
    .replace("{location}", location || "")
    .replace("{description}", description || "");

  // 2. Get AI response
  const aiRaw = await getResponse(prompt);

  const cleaned = aiRaw
    .replace(/```json/i, "")  // remove opening ```json
    .replace(/```/g, "")      // remove closing ```
    .trim();

  // 3. Parse JSON safely
  let formattedEvent = {};
  try {
    formattedEvent = JSON.parse(cleaned);
    if (!Array.isArray(formattedEvent.tags)) {
      formattedEvent.tags = [];
    }
  } catch (err) {
    console.error("AI JSON parse error:", aiRaw);
    formattedEvent = {};
  }

  // 4. Ensure valid date
  let parsedDate = new Date(date);
  if (formattedEvent.date) {
    const d = new Date(formattedEvent.date);
    if (!isNaN(d.getTime())) {
      parsedDate = d;
    }
  }

  // 5. Merge with schema (AI fills everything except banner)
  const finalEvent = {
    banner: banner.url,
    title: formattedEvent.title || title,
    description: formattedEvent.description || description,
    date: parsedDate,
    time: formattedEvent.time || time,
    location: formattedEvent.location || location,
    mode: formattedEvent.mode || "Offline",
    organizer: formattedEvent.organizer || "",
    speaker: formattedEvent.speaker || "",
    tags: formattedEvent.tags || [],
    status: formattedEvent.status || "Upcoming",
  };

  // 6. Save to DB
  const event = new Event(finalEvent);
  await event.save();

  res.status(200).json(new ApiResponse(200, event, "Event created successfully"));
});

const getAllEvents = asyncHandler(async(req,res)=>{
    const { status, mode, tags, sortBy, order } = req.query;

    let filter = {};

    if (status) filter.status = status; 
    if (mode) filter.mode = mode;
    if (tags) filter.tags = { $in: tags.split(",") }; 

    let sort = {};
    if (sortBy) {
        sort[sortBy] = order === "asc" ? 1 : -1;
    } else {
        sort = { createdAt: -1 };
    }

    const events = await Event.find(filter).sort(sort);

    return res
    .status(200)
    .json(
        new ApiResponse(200,{events,count:events.length},"all event fetched successfully")
    );
})

const updateEventDetails = asyncHandler(async(req,res)=>{
    const {eventId} = req.params;
    const oldEvent = await Event.findById(eventId);
    if (!oldEvent) {
      throw new ApiError(404, "Event not found");
    }
    const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $set: req.body },
        { new: true}
    );

    const isChanged = Object.keys(req.body).some(
      (key) => String(oldEvent[key]) !== String(updatedEvent[key])
    );

    if (!isChanged) {
      throw new ApiError(400, "No fields were updated");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedEvent,"event details updated")
    )
})

const deleteEvent = asyncHandler(async(req,res)=>{
    const {eventId} = req.params;
    if(!eventId){
        throw new ApiError(400,"event doesn't exist");
    }
    await Event.deleteOne({_id:eventId});
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"deleted the event Successfully")
    )
})

const ChangeBanner = asyncHandler(async(req,res)=>{
  const {eventId} = req.params;

  const oldBannerUrl = event.banner;
  if(oldBannerUrl){
    await deleteOnCloudinary(oldBannerUrl);
  }

  const bannerLocalPath = req.file?.path;
  if (!bannerLocalPath) {
    throw new ApiError(400, "Kindly upload banner also");
  }

  const banner = await uploadOnCloudinary(bannerLocalPath);
  if (!banner.url) {
    throw new ApiError(500, "Something went wrong while uploading on cloudinary");
  }
  await Event.findByIdAndUpdate()
})
export {createEvent,
        getAllEvents,
        updateEventDetails,
        deleteEvent
 };
