# Release checklist

Every release follows the same steps. The release captain rotates each sprint and signs off on every row before the next one starts.

| Step | Owner | When | Done |
| --- | --- | --- | --- |
| Freeze the release branch | Release captain | Tuesday 10 am | No |
| Run the full regression suite | QA | Tuesday | No |
| Smoke test on staging with the demo account | Support | Wednesday | No |
| Write the release notes | Product | Wednesday | No |
| Deploy to production | Release captain | Thursday before 2 pm | No |
| Watch error rate and checkout latency for 30 minutes | Platform | Thursday | No |
| Send the customer newsletter | Marketing | Friday | No |

Roll back if the error rate stays above 2% for five minutes. Do not wait for a root cause before rolling back.
