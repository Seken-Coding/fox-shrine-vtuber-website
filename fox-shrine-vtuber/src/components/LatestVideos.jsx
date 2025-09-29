import { PlaceholderImage } from './PlaceholderImages';
import { useConfigDatabase } from '../hooks/useConfigDatabase';

const LatestVideos = () => {
  const { config } = useConfigDatabase();
  const videos = Array.isArray(config?.content?.latestVideos) ? config.content.latestVideos : [];
  return (
    <section className="py-16 bg-shrine-white dark:bg-dark-bg">
      <div className="container mx-auto px-4">
  <h2 className="section-title">Latest Videos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {(videos.length ? videos : []).map(video => (
            <div key={video.id} className="group">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <PlaceholderImage 
                  width="100%"
                  height={208}
                  text="📹 Video"
                  className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 right-0 bg-shrine-dark/80 text-white px-2 py-1 text-sm">
                  {video.duration}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-4 w-full">
                    <a href={`/videos/${video.id}`} className="font-medium text-white hover:text-shrine-gold transition-colors">
                      Watch Now
                    </a>
                  </div>
                </div>
              </div>
              
              <h3 className="mt-3 font-medium text-lg line-clamp-2 text-shrine-dark dark:text-dark-text">{video.title}</h3>
              <div className="flex justify-between text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
                <span>{video.views} views</span>
                <span>{video.date}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <a href="/content" className="fox-button inline-flex items-center">
            <span>View All Videos</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default LatestVideos;