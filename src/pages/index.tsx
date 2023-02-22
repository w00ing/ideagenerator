import { useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useOpenAIStream } from '@/hooks/useOpenAIStream';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

import { Locale, locales } from '@/lib/locale';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ResizablePanel from '@/components/ui/ResizablePanel';

type PromptType = 'idea' | 'XYZ' | 'xyz';

type FormData = {
  input: string;
};

const Xyz: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    console.log(router.locale);
  }, [router.locale]);
  const [idea, loadingIdea, generateIdeaStream, doneGeneratingIdea] = useOpenAIStream();
  const [XYZ, loadingXYZ, generateXYZStream, doneGeneratingXYZ] = useOpenAIStream();
  const [xyz, loadingxyz, generatexyzStream, doneGeneratingxyz] = useOpenAIStream();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { input: '' },
  });
  return (
    <Layout>
      <Head>
        <title>Idea Generator</title>
      </Head>
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-2">
        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          {Locale[(router.locale ?? 'en') as keyof typeof locales].title}
        </h3>
        <form
          onSubmit={handleSubmit((formData) => generateIdeaStream({ input: formData.input, type: 'idea' }))}
          className="mt-4 flex w-full max-w-sm items-center space-x-2"
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
                  <p className="rounded-lg bg-slate-200 px-6 py-4 text-slate-900">{idea}</p>
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
                <div className="flex flex-col items-center py-4">
                  <p className="text-center [&:not(:first-child)]:mt-6">{XYZ}</p>

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
                <div className="flex flex-col items-center py-4">
                  {xyz && <p className="text-center [&:not(:first-child)]:mt-6">{xyz}</p>}
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
    </Layout>
  );
};

export default Xyz;
