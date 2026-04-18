import { Quote, Star } from 'lucide-react';

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatarUrl?: string;
}

const Testimonial = ({ name, role, content, rating, avatarUrl }: TestimonialProps) => {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative hover:shadow-lg transition-shadow">
      <div className="absolute top-6 right-8 text-primary/10">
        <Quote className="w-12 h-12 fill-current" />
      </div>
      
      <div className="flex items-center space-x-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
          />
        ))}
      </div>

      <p className="text-gray-600 italic mb-8 leading-relaxed text-lg">
        &quot;{content}&quot;
      </p>

      <div className="flex items-center space-x-4">
        <img 
          src={avatarUrl || `https://ui-avatars.com/api/?name=${name}&background=random`} 
          alt={name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-50"
        />
        <div>
          <h4 className="text-gray-900 font-bold">{name}</h4>
          <p className="text-gray-500 text-sm font-medium">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
