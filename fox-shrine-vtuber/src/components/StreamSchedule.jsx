import { useConfigDatabase } from '../hooks/useConfigDatabase';

const StreamSchedule = () => {
  const { config } = useConfigDatabase();
  const scheduleData = Array.isArray(config?.content?.schedule) ? config.content.schedule : [];
  return (
    <section className="py-16 bg-shrine-white dark:bg-dark-bg">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Stream Schedule</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {scheduleData.map((item, index) => (
            <div 
              key={index} 
              className="shrine-card hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="text-4xl text-center mb-4">{item.icon}</div>
              <h3 className="font-cinzel text-xl text-shrine-red dark:text-dark-shrine-red text-center mb-2">{item.day}</h3>
              <p className="text-center font-medium text-fox-orange dark:text-dark-fox-orange mb-4">{item.time}</p>
              <h4 className="text-center font-bold mb-2 text-shrine-dark dark:text-dark-text">{item.title}</h4>
              <p className="text-center text-sm text-gray-600 dark:text-dark-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <a 
            href="/schedule" 
            className="fox-button inline-flex items-center"
          >
            <span>Full Schedule</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default StreamSchedule;