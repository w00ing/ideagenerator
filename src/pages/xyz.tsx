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

type Body = {
  input: string;
  type: PromptType;
  locale?: string;
};

const sampleIdea = {
  en: `An IT service that provides remote monitoring and maintenance of air purifiers in homes and businesses. The service would provide real-time data on air quality, filter replacement reminders, and automated troubleshooting.
`,
  ko: `공기청정기 자동 제어 서비스. 사용자는 스마트폰으로 공기청정기의 작동 상태를 실시간으로 확인할 수 있고, 스마트폰 앱을 통해 공기청정기의 작동 시간과 설정을 조절할 수 있다. 또한, 사용자는 스마트폰 앱을 통해 공기청정기의 필터 상태를 확인하고 교체할 수 있다.`,
};
const sampleXYZ = {
  en: `At least 80% of businesses and homes with air purifiers will use the IT service for remote monitoring and maintenance.`,
  ko: `적어도 90%의 사용자는 스마트폰 앱을 통해 공기청정기의 작동 시간과 설정, 필터 상태를 확인하고 관리할 것이다.`,
};

const samplexyz = {
  en: `At least 80% of businesses and homes with air purifiers in the city of Los Angeles will use the IT service for remote monitoring and maintenance.`,
  ko: `적어도 90%의 서울 시민들은 스마트폰 앱을 통해 가정용 공기청정기의 작동 시간과 설정, 필터 상태를 확인하고 관리할 것이다.`,
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
        <title>XYZ Generator</title>
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
