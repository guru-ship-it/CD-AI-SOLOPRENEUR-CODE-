import { VerificationAdapter, StandardResult } from "../interface";
import { ImageAnnotatorClient } from "@google-cloud/vision";

const visionClient = new ImageAnnotatorClient();

export class VisionAdapter implements VerificationAdapter {
    endpoint = "GOOGLE_VISION_INTERNAL";
    method: "POST" = "POST";

    buildRequest(inputs: { imageBase64: string }) {
        return {
            image: { content: inputs.imageBase64 },
            features: [{ type: "TEXT_DETECTION" }]
        };
    }

    async verify(inputs: { imageBase64: string }): Promise<StandardResult> {
        // Direct implementation since it's a client library call
        try {
            const [result] = await visionClient.textDetection({
                image: { content: inputs.imageBase64 }
            });

            return this.normalizeResponse(result);
        } catch (error: any) {
            return {
                isValid: false,
                rawResponse: error.message,
                error: "Vision AI Analysis Failed"
            };
        }
    }

    normalizeResponse(apiResponse: any): StandardResult {
        const fullText = apiResponse.fullTextAnnotation?.text || "";

        // FAT 3.4 Requirement: Low Confidence Warning
        // Simplified logic: Check symbol confidence
        let totalConfidence = 0;
        let symbolCount = 0;

        apiResponse.fullTextAnnotation?.pages?.forEach((page: any) => {
            page.blocks?.forEach((block: any) => {
                block.paragraphs?.forEach((para: any) => {
                    para.words?.forEach((word: any) => {
                        word.symbols?.forEach((symbol: any) => {
                            totalConfidence += symbol.confidence || 0;
                            symbolCount++;
                        });
                    });
                });
            });
        });

        const averageConfidence = symbolCount > 0 ? totalConfidence / symbolCount : 0;
        const isLowConfidence = averageConfidence < 0.7;

        return {
            isValid: fullText.length > 10,
            legalName: "OCR EXTRACTED",
            rawResponse: apiResponse,
            error: isLowConfidence ? "Low Confidence: Blurry ID detected (Explainable AI)" : undefined
        };
    }
}
