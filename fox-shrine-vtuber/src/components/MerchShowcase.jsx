import { PlaceholderImage } from './PlaceholderImages';
import { useConfigDatabase } from '../hooks/useConfigDatabase';

const MerchShowcase = () => {
  const { config } = useConfigDatabase();
  const merchData = Array.isArray(config?.content?.merch) ? config.content.merch : [];
  return (
    <section className="py-16 bg-gray-50 dark:bg-dark-bg relative overflow-hidden">
      {/* Decorative shrine gates */}
      <div className="absolute -left-20 top-0 bottom-0 opacity-10">
        <img src="/decorative/shrine-gate.svg" alt="" className="h-full" />
      </div>
      <div className="absolute -right-20 top-0 bottom-0 opacity-10">
        <img src="/decorative/shrine-gate.svg" alt="" className="h-full" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="section-title text-center">Fox Shrine Merch</h2>
        <p className="text-center max-w-xl mx-auto mb-12 text-shrine-dark dark:text-dark-text-secondary">Take a piece of the shrine home with you! Official merchandise featuring our mischievous fox mascot.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {merchData.map(item => (
            <div key={item.id} className="group">
              <div className="relative bg-white dark:bg-dark-card rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-dark-border">
                {item.isNew && (
                  <div className="absolute top-0 right-0 bg-shrine-red dark:bg-dark-shrine-red text-white text-xs font-bold px-2 py-1 z-10">
                    NEW
                  </div>
                )}
                
                <div className="h-64 overflow-hidden">
                  <PlaceholderImage 
                    width="100%"
                    height="100%"
                    text="🛍️ Merch"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-cinzel text-lg text-shrine-dark dark:text-dark-text">{item.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium text-shrine-dark dark:text-dark-text">{item.price}</span>
                    <button className="bg-fox-orange dark:bg-dark-fox-orange text-white text-sm px-3 py-1 rounded hover:bg-shrine-red dark:hover:bg-dark-shrine-red transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <a href="/merch" className="fox-button inline-flex items-center">
            <span>Shop All Merch</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default MerchShowcase;