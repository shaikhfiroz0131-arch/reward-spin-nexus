import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function YouTubeSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ'); // Example video
  const { toast } = useToast();

  const handleWatchVideo = () => {
    setIsVideoOpen(true);
  };

  const handleVideoComplete = async () => {
    try {
      // Award coins for watching video
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userData) {
        await supabase
          .from('users')
          .update({ coins: userData.coins + 50 })
          .eq('id', userData.id);

        await supabase
          .from('transactions')
          .insert({
            user_id: userData.id,
            type: 'credit',
            amount: 50,
            source: 'video',
            description: 'Watched YouTube video'
          });
      }
    } catch (error) {
      console.error('Error awarding video coins:', error);
    }
    setIsVideoOpen(false);
  };

  return (
    <>
      <Card className="card-gaming">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-6 h-6 text-primary" />
            Watch Video
          </CardTitle>
          <CardDescription>
            Watch our featured video to earn coins!
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Button 
            variant="gaming" 
            onClick={handleWatchVideo}
            className="w-full text-lg py-6"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Watching (+50 Coins)
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center justify-between">
              Featured Video
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsVideoOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 p-4">
            <iframe
              src={videoUrl}
              className="w-full h-full rounded-lg"
              allowFullScreen
              title="Featured Video"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}