# Deploying Cart Recovery AI to EKS

## How configuration is loaded

The `.env` file is **local-dev only** (sourced by `run-live.sh`). It is never
shipped. In the cluster the same variables are injected as pod environment
variables:

| Source | Variables | How |
|--------|-----------|-----|
| `configmap.yaml` | `LITELLM_BASE_URL`, `LITELLM_MODEL`, `CART_*` | `envFrom.configMapRef` |
| `secret.yaml` | `LITELLM_API_KEY` | `envFrom.secretRef` |

Spring Boot resolves the `${LITELLM_*}` / `${CART_*}` placeholders in
`application.yml` from those env vars. No `.env`, no `run-live.sh`.

## 1. Build and push the image

The image must be built where Maven has network access (the `mvn package`
step pulls Spring Boot 3.3.4 from Maven Central). If you build behind a
corporate mirror, add a `settings.xml` to the build.

```bash
AWS_ACCOUNT=123456789012
REGION=us-east-1
REPO=$AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com/cart-recovery

aws ecr create-repository --repository-name cart-recovery --region $REGION
aws ecr get-login-password --region $REGION \
  | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com

docker build -t $REPO:0.1.0 .
docker push $REPO:0.1.0
```

Then set that image URI in `deployment.yaml` (replace `REPLACE_WITH_ECR_IMAGE_URI`).

## 2. Create the secret

Do **not** apply `secret.yaml` with a real key committed. Either:

```bash
kubectl create secret generic cart-recovery-secrets \
  --from-literal=LITELLM_API_KEY='sk-...'
```

or, for production, store the key in **AWS Secrets Manager** and sync it with
the **External Secrets Operator** (authenticated via **IRSA**) so no secret
value lives in git.

## 3. Apply the manifests

```bash
kubectl apply -k k8s/          # configmap, deployment, service, ingress
```

(`kustomization.yaml` deliberately excludes the Secret — see step 2.)

## 4. Verify

```bash
kubectl rollout status deployment/cart-recovery
kubectl get ingress cart-recovery        # ALB address
```

## Notes

- **Probes** use Spring Boot Actuator: `livenessProbe` → `/actuator/health/liveness`,
  `readinessProbe` (and `startupProbe`) → `/actuator/health/readiness`. The ALB
  health check uses `/actuator/health`. Only the `health` endpoint is exposed.
- **`readOnlyRootFilesystem`** is on; an `emptyDir` is mounted at `/tmp` for
  embedded Tomcat's work directory.
- **In-memory state** — carts and metrics live in process memory, so each of
  the 2 replicas has its own. Fine for the demo; a shared datastore (the real
  Cart DB) would be needed before scaling out for production traffic.
