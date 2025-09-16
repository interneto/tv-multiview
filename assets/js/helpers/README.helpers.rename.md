Mapping proposal Spanish -> English filenames:

- helperActualizarBotonesFlotantes.js -> helperUpdateFloatingButtons.js
- helperActualizarBotonesOverlay.js -> helperUpdateOverlayButtons.js
- helperActualizarValorSlider.js -> helperUpdateSliderValue.js
- helperAgregarEventListener.js -> helperAddEventListener.js
- helperAjustarClasesCanalesActivos.js -> helperAdjustActiveChannelClasses.js
- helperAjustarVisibilidadBotonesQuitarTodaSeñal.js -> helperToggleVisibilityOfRemoveSignalButtons.js
- helperBSToast.js -> helperBSToast.js (keep same)
- helperBSTooltips.js -> helperBSTooltips.js (keep same)
- helperInsertDivError.js -> helperInsertDivError.js
- helperCambioOrdenBotones.js -> helperChangeButtonsOrder.js
- helperCanalesPorDefecto.js -> helperDefaultChannels.js
- helperCheckboxState.js -> helperCheckboxState.js (keep same)
- helperCheckSeñalesVacias.js -> helperCheckEmptySignals.js
- helperClaseBoton.js -> helperButtonClass.js
- helperCrearBotonesPaises.js -> helperCreateCountryButtons.js
- helperEstadoConexion.js -> helperConnectionState.js
- helperChannelFilter.js -> helperFilterChannels.js
- helperGenerarBotonesCanales.js -> helperGenerateChannelButtons.js
- helperGuardarCanales.js -> helperSaveChannels.js
- helperM3U.js -> helperM3U.js (keep same)
- helperNombresSimilares.js -> helperSimilarNames.js
- helperNumeroFilas.js -> helperRowNumber.js
- helperOcultarTextoBotonesOverlay.js -> helperHideOverlayButtonText.js
- helperOrdenGridVisionUnica.js -> helperSingleViewGridOrder.js
- helperPlayAudio.js -> helperPlayAudio.js (keep same)
- helperQuitarTodo.js -> helperRemoveAll.js
- helperReemplazarCanalActivo.js -> helperReplaceActiveChannel.js
- helperEmptySignal.js -> helperEmptySignal.js
- helperTheme.js -> helperTheme.js
- helperUnicVision.js -> helperSingleView.js

Plan:
1. Create new English-named wrapper files that re-export everything from the Spanish originals.
2. Update `helpers/index.js` to export from the new English wrapper files (and also preserve original exports for backward compatibility for now).
3. Search and update direct imports optionally (we'll keep compatibility so not strictly necessary immediately).

I'll create wrapper files for a subset first (the most used ones) and update `helpers/index.js` to add the English exports. Let me know if you want a full rename (moving files) instead of wrappers.