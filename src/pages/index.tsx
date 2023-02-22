import { useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useOpenAIStream } from '@/hooks/useOpenAIStream';
import { useToast } from '@/hooks/useToast';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useCopyToClipboard } from 'usehooks-ts';

import { Locale, locales } from '@/lib/locale';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ResizablePanel from '@/components/ui/ResizablePanel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

type FormData = {
  input: string;
};

const Xyz: NextPage = () => {
  const router = useRouter();

  const [idea, loadingIdea, generateIdeaStream, doneGeneratingIdea, clearIdea] = useOpenAIStream();
  const [XYZ, loadingXYZ, generateXYZStream, doneGeneratingXYZ, clearXYZ] = useOpenAIStream();
  const [xyz, loadingxyz, generatexyzStream, doneGeneratingxyz, clearxyz] = useOpenAIStream();

  const [value, copy] = useCopyToClipboard();

  const { toast } = useToast();

  const clear = () => {
    clearIdea();
    clearXYZ();
    clearxyz();
  };

  const { register, handleSubmit, setFocus } = useForm<FormData>({
    defaultValues: { input: '' },
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFocus('input');
    }, 100);
    return () => clearTimeout(timeout);
  }, [setFocus]);

  return (
    <Layout>
      <Head>
        <title>Idea Generator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <section className="mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center px-4 pb-2 pt-24 sm:max-w-lg">
        <form
          onSubmit={handleSubmit((formData) => {
            clear();
            generateIdeaStream({ input: formData.input, type: 'idea' });
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          })}
          className="mt-4 flex w-full max-w-lg items-center space-x-2"
        >
          <Input
            type="text"
            className="flex-1"
            placeholder={Locale[(router.locale ?? 'en') as keyof typeof locales].placeholder}
            {...register('input', {
              required: true,
              minLength: 1,
            })}
          />
          <Button loading={loadingIdea}>{Locale[(router.locale ?? 'en') as keyof typeof locales].button.idea}</Button>
        </form>

        <ResizablePanel>
          <AnimatePresence>
            <motion.div
              className="mt-4 flex h-full w-full flex-col items-center justify-center gap-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {idea && (
                <div className="flex flex-col items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p
                          onClick={() => copy(idea).then(() => toast({ title: 'Copied to clipboard' }))}
                          className="cursor-pointer rounded-md bg-slate-200 px-6 py-4 text-slate-900"
                        >
                          {idea}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {!loadingIdea && (
                    <Button
                      className="mt-3"
                      onClick={() => generateXYZStream({ input: idea, type: 'XYZ' })}
                      loading={loadingXYZ}
                    >
                      {Locale[(router.locale ?? 'en') as keyof typeof locales].button.XYZ}
                    </Button>
                  )}
                </div>
              )}
              {idea && XYZ && (
                <div className="flex flex-col items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p
                          className="cursor-pointer bg-slate-100 px-6 py-4 [&:not(:first-child)]:mt-6"
                          onClick={() => copy(XYZ).then(() => toast({ title: 'Copied to clipboard' }))}
                        >
                          {XYZ}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {!loadingXYZ && (
                    <Button
                      className="mt-3"
                      onClick={() => generatexyzStream({ input: XYZ, type: 'xyz' })}
                      loading={loadingxyz}
                    >
                      {Locale[(router.locale ?? 'en') as keyof typeof locales].button.xyz}
                    </Button>
                  )}
                </div>
              )}
              {idea && XYZ && xyz && (
                <div className="flex flex-col items-center">
                  {xyz && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p
                            className="cursor-pointer bg-slate-50 px-6 py-4 [&:not(:first-child)]:mt-6"
                            onClick={() => copy(xyz).then(() => toast({ title: 'Copied to clipboard' }))}
                          >
                            {xyz}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {!loadingxyz && (
                    <Button
                      className="mt-3"
                      onClick={() => generatexyzStream({ input: xyz, type: 'xyz' })}
                      loading={loadingxyz}
                    >
                      {Locale[(router.locale ?? 'en') as keyof typeof locales].button.further}
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </section>
      <Footer />
    </Layout>
  );
};

export default Xyz;
