import { MockEmbeddingProvider } from "./providers/mock.embedding";
import { logger } from '../config/logger';


(async () => {
    const provider = new MockEmbeddingProvider();
    const vec = await provider.embed("hello world");
    logger.info(vec.length); // should be 1536
})();
