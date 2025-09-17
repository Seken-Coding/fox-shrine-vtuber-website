import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaGamepad, FaPaintBrush, FaUsers, FaCalendarAlt, FaRegBell, FaRegMoon } from 'react-icons/fa';
import SEO from '../components/SEO';

// --- TEMPLATE DATA: Just fill this out! ---

// Your weekly schedule. Use 24-hour format (e.g., '19:00').
// The timezone is assumed to be UTC, the converter will handle the rest.
const weeklySchedule = [
  { day: 'Monday', time: '19:00', game: 'Stardew Valley', title: 'Mischief Mondays: Farming & Shenanigans' },
  { day: 'Tuesday', time: null, game: 'Day Off', title: 'Resting in the Shrine' },
  { day: 'Wednesday', time: '20:00', game: 'Art Stream', title: 'Creative Wednesday: New Emotes!' },
  { day: 'Thursday', time: null, game: 'Day Off', title: 'Polishing the Shrine' },
  { day: 'Friday', time: '21:00', game: 'Phasmophobia', title: 'Spooky Shrine Frights (with friends!)' },
  { day: 'Saturday', time: '18:00', game: 'Community Games', title: 'Fox Den Hangout: Jackbox & Fun' },
  { day: 'Sunday', time: null, game: 'Day Off', title: 'Quiet Contemplation' },
];

// Upcoming special events.
const specialEvents = [
  { date: 'October 31st', title: 'Halloween 12-Hour Special', description: 'A spooky marathon of horror games and costume contests!' },
  { date: 'December 20th', title: 'Charity Drive for Animal Shelters', description: 'Raising money for our furry friends with fun incentives and games.' },
];

// --- Component Starts Here ---

// Helper to get the right icon for the stream type
const getIconForGame = (game) => {
  const lowerCaseGame = game.toLowerCase();
  if (lowerCaseGame.includes('art')) return <FaPaintBrush className="mr-2" />;
  if (lowerCaseGame.includes('community') || lowerCaseGame.includes('jackbox')) return <FaUsers className="mr-2" />;
  if (lowerCaseGame.includes('day off')) return <FaRegMoon className="mr-2" />;
  return <FaGamepad className="mr-2" />;
};

const SchedulePage = () => {
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [localSchedule, setLocalSchedule] = useState([]);

  useEffect(() => {
    const convertSchedule = () => {
      const newSchedule = weeklySchedule.map(item => {
        if (!item.time) return { ...item, localTime: null };
        
        const [hour, minute] = item.time.split(':');
        const date = new Date();
        date.setUTCHours(hour, minute, 0, 0);

        const localTimeString = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: timeZone,
        });
        
        return { ...item, localTime: localTimeString };
      });
      setLocalSchedule(newSchedule);
    };
    convertSchedule();
  }, [timeZone]);

  return (
    <>
      <SEO 
        title="Stream Schedule - Fox Shrine"
        description="Find out when the next live stream is happening and join the fox den!"
      />
      <div className="bg-shrine-white py-24 px-4">
        <div className="container mx-auto">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-shrine-red">Stream Schedule</h1>
            <p className="text-shrine-dark text-lg mt-2">Offerings of entertainment for the week. All times are in your local timezone!</p>
          </motion.div>

          {/* Timezone Selector */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center bg-white p-2 rounded-full shadow-md">
              <FaClock className="text-shrine-dark mx-2" />
              <select 
                value={timeZone} 
                onChange={(e) => setTimeZone(e.target.value)}
                className="bg-transparent font-nunito focus:outline-none"
              >
                <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Your Timezone</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">ET</option>
                <option value="America/Chicago">CT</option>
                <option value="America/Denver">MT</option>
                <option value="America/Los_Angeles">PT</option>
                <option value="Europe/London">GMT/BST</option>
              </select>
            </div>
          </div>

          {/* Weekly Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {localSchedule.map((item, index) => (
              <motion.div 
                key={item.day}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-lg shadow-lg p-6 flex flex-col text-center transition-all duration-300 ${item.time ? 'bg-white border-t-4 border-fox-orange' : 'bg-gray-100 border-t-4 border-gray-300'}`}
              >
                <h3 className="font-cinzel text-2xl font-bold text-shrine-dark mb-4">{item.day}</h3>
                {item.time ? (
                  <>
                    <div className="text-3xl font-bold text-shrine-red mb-4">
                      {item.localTime}
                    </div>
                    <div className="flex items-center justify-center text-lg text-shrine-dark mb-2">
                      {getIconForGame(item.game)}
                      <span>{item.game}</span>
                    </div>
                    <p className="text-gray-500 flex-grow">{item.title}</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-grow my-4">
                    <FaRegMoon className="text-4xl text-gray-400 mb-2" />
                    <p className="text-gray-500 font-semibold">{item.title}</p>
                  </div>
                )}
              </motion.div>
            ))}
             {/* "Always On" Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="rounded-lg shadow-lg p-6 flex flex-col text-center bg-gradient-to-br from-shrine-red to-fox-orange text-white md:col-span-2 lg:col-span-1 xl:col-span-1"
            >
              <h3 className="font-cinzel text-2xl font-bold mb-4">Community Hub</h3>
              <div className="flex flex-col items-center justify-center flex-grow my-4">
                <FaUsers className="text-4xl mb-2" />
                <p className="font-semibold">The Fox Den is always open!</p>
                <p className="text-sm mt-2">Join our Discord for offline chats, memes, and announcements.</p>
              </div>
              <a href="#" className="mt-4 bg-white text-shrine-red font-bold py-2 px-4 rounded-full hover:bg-shrine-white transition-colors">Join Discord</a>
            </motion.div>
          </div>

          {/* Special Events Section */}
          <div className="mt-24">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="font-cinzel text-4xl font-bold text-shrine-red">Special Shrine Events</h2>
              <p className="text-shrine-dark text-lg mt-2">Mark your calendars for these special occasions!</p>
            </motion.div>
            <div className="space-y-8 max-w-3xl mx-auto">
              {specialEvents.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-6 border-l-4 border-shrine-gold"
                >
                  <div className="text-shrine-red">
                    <FaCalendarAlt className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="font-bold text-shrine-dark text-sm">{event.date}</p>
                    <h3 className="font-cinzel text-2xl text-shrine-red">{event.title}</h3>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                  <button className="ml-auto bg-fox-orange/10 text-fox-orange p-3 rounded-full hover:bg-fox-orange/20 transition-colors">
                    <FaRegBell />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default SchedulePage;
