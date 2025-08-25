import React from "react";
import { Event } from "@/types"; 

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="max-w-3xl mx-auto bg-white  rounded-2xl overflow-hidden  border-gray-100">
      <div className="relative">
        <img
          src={
            event.image_url !== ""
              ? event.image_url
              : "https://www.acadiate.com/images/Placeholder.png"
          }
          alt={event.eventTitle}
          className="w-full h-64 object-cover"
        />
        <span className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 text-xs font-semibold rounded-full shadow">
          {event.eventType}
        </span>
        <span className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 text-xs font-semibold rounded-full shadow">
          {event.status}
        </span>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {event.eventTitle}
        </h2>
        <p className="text-gray-600 mb-4">{event.eventDescription}</p>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
          <div>
            <p className="font-semibold"> Date</p>
            <p>{event.date}</p>
          </div>
          <div>
            <p className="font-semibold">Time</p>
            <p>
              {event.startTime} - {event.endTime}
            </p>
          </div>
          <div>
            <p className="font-semibold">Location</p>
            <p>
              {event.location}, {event.city}
            </p>
          </div>
          <div>
            <p className="font-semibold">Reward</p>
            <p>{event.reward}</p>
          </div>
        </div>

        {event.sponsor.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Sponsors</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {event.sponsor.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Participants */}
        {event.participant.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900">Participants</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {event.participant.map((p, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-4">
          <span>Created by: {event.createdBy}</span>
          {event.approvedBy && <span>Approved by: {event.approvedBy}</span>}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
