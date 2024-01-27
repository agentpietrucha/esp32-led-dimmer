'use client';

import { useDebouncedCallback } from 'use-debounce';
import { Button } from './button';
import { Slider } from './slider';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { getDeviceState, updateDevice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { ReloadIcon } from '@radix-ui/react-icons';

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export function LEDControls() {
  const { toast } = useToast();
  const { user, isLoading } = useKindeBrowserClient();

  const [loading, setLoading] = useState(true);

  const [switchValue, setSwitchValue] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);

  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    getDeviceState(user!)
      .then(async (response) => {
        const text = await response.text();
        if (response.status !== 200) throw new Error(text);
        return text;
      })
      .then((response) => handleInitialState(parseInt(response)))
      .catch((e) => {
        console.log('[LEDControls] getDeviceState error', e);
        let message = e instanceof Error ? e.message : 'Server Error';
        message = message || 'Server Error';
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: message,
        });
      })
      .finally(() => setLoading(false));
  }, [isLoading]);

  const handleInitialState = (value: number) => {
    if (isNaN(value)) value = 0;
    setSliderValue(value);
    setSwitchValue(value > 0);
  };

  const handleSwitch = () => {
    setSwitchLoading(true);
    updateDevice(switchValue ? 0 : sliderValue, user!)
      .then(async (response) => {
        const text = await response.text();
        if (response.status !== 200) throw new Error(text);

        setSwitchValue((prevState) => !prevState);
      })
      .catch((e) => {
        let message = e instanceof Error ? e.message : 'Server Error';
        message = message || 'Server Error';
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: message,
        });
      })
      .finally(() => setSwitchLoading(false));
  };

  const handleSlider = useDebouncedCallback((value: number[]) => {
    updateDevice(value[0], user!)
      .then(async (response) => {
        const text = await response.text();
        if (response.status !== 200) throw new Error(text);
      })
      .catch((e) => {
        let message = e instanceof Error ? e.message : 'Server Error';
        message = message || 'Server Error';
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: message,
        });
      });
  }, 200);

  if (loading || isLoading)
    return <span className="text-center">Loading...</span>;

  return (
    <div className="flex justify-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-5 max-w-96">
        <Button
          className={clsx({
            'bg-green-500 hover:bg-green-800': switchValue,
            'bg-red-500 hover:bg-red-800': !switchValue,
          })}
          size={'lg'}
          onClick={handleSwitch}
          disabled={switchLoading}
        >
          {switchLoading && (
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          )}
          {switchValue ? 'ON' : 'OFF'}
        </Button>
        <Slider
          defaultValue={[50]}
          value={[sliderValue]}
          max={100}
          step={1}
          onValueCommit={(value) => handleSlider(value)}
          onValueChange={(value) => setSliderValue(value[0])}
        ></Slider>
      </div>
    </div>
  );
}
